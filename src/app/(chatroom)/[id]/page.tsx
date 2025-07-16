"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { addMessage, prependMessages, Message, selectMessagesByChatroomId } from "@/features/messages/messagesSlice";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const PAGE_SIZE = 20;

export default function ChatroomPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const allMessages = useSelector((state: RootState) => selectMessagesByChatroomId(state, id));
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatTopRef = useRef<HTMLDivElement>(null);

  // Paginated messages (latest PAGE_SIZE * page)
  const paginatedMessages = allMessages.slice(-PAGE_SIZE * page);
  const hasMore = allMessages.length > paginatedMessages.length;

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [paginatedMessages.length, aiTyping]);

  // Send user message and/or image, simulate AI reply
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;
    const userMsg: Message = {
      id: uuidv4(),
      chatroomId: id,
      sender: "user",
      content: input,
      timestamp: Date.now(),
      image: image || undefined,
    };
    dispatch(addMessage(userMsg));
    setInput("");
    setImage(null);
    setAiTyping(true);
    // Simulate AI thinking delay (throttled)
    setTimeout(() => {
      const aiMsg: Message = {
        id: uuidv4(),
        chatroomId: id,
        sender: "ai",
        content: `Gemini: ${getFakeAiReply(userMsg.content)}`,
        timestamp: Date.now(),
      };
      dispatch(addMessage(aiMsg));
      setAiTyping(false);
    }, 1200 + Math.random() * 1000);
  };

  // Simulate loading older messages
  const loadOlderMessages = () => {
    setLoadingOlder(true);
    setTimeout(() => {
      // Simulate dummy older messages
      const dummy: Message[] = Array.from({ length: PAGE_SIZE }, (_, i) => ({
        id: uuidv4(),
        chatroomId: id,
        sender: i % 2 === 0 ? "user" : "ai",
        content: i % 2 === 0 ? `Older user message #${i + 1 + PAGE_SIZE * (page - 1)}` : `Older Gemini message #${i + 1 + PAGE_SIZE * (page - 1)}`,
        timestamp: Date.now() - (PAGE_SIZE * page - i) * 60000,
      }));
      dispatch(prependMessages(dummy));
      setPage(p => p + 1);
      setLoadingOlder(false);
    }, 900);
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const removeImage = () => setImage(null);

  // Copy message content (and image URL if present) to clipboard
  const handleCopy = async (msg: Message) => {
    let text = msg.content;
    if (msg.image) {
      text = msg.content ? `${msg.content}\n${msg.image}` : msg.image;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[500px] flex flex-col">
        <h1 className="text-2xl font-bold mb-6 text-center">Chatroom</h1>
        <div className="flex-1 overflow-y-auto mb-4 px-1" style={{ maxHeight: 400 }}>
          <div ref={chatTopRef} />
          {hasMore && (
            <div className="flex justify-center mb-2">
              <button
                onClick={loadOlderMessages}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                disabled={loadingOlder}
              >
                {loadingOlder ? (
                  <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></span> Loading...</span>
                ) : (
                  "Load older messages"
                )}
              </button>
            </div>
          )}
          {loadingOlder && (
            <div className="flex flex-col gap-2 mb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
              ))}
            </div>
          )}
          {paginatedMessages.length === 0 && !loadingOlder && (
            <div className="text-center text-gray-400 py-8">No messages yet. Say hello!</div>
          )}
          {paginatedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-2 group relative`}
              onMouseEnter={() => setHoveredMsg(msg.id)}
              onMouseLeave={() => setHoveredMsg(null)}
            >
              <div className={`rounded-lg px-4 py-2 max-w-xs break-words ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"} relative`}>
                {msg.image && (
                  <Image src={msg.image} alt="uploaded" className="mb-2 max-w-[180px] max-h-[180px] rounded shadow" />
                )}
                <div>{msg.content}</div>
                <div className="text-xs text-gray-300 dark:text-gray-400 mt-1 text-right">{formatTime(msg.timestamp)}</div>
                {hoveredMsg === msg.id && (
                  <button
                    onClick={() => handleCopy(msg)}
                    className="absolute top-1 right-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-1 text-xs shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    aria-label="Copy message"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>
          ))}
          {aiTyping && (
            <div className="flex justify-start mb-2">
              <div className="rounded-lg px-4 py-2 max-w-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 animate-pulse">
                Gemini is typing...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex flex-col gap-2 mt-auto">
          {image && (
            <div className="flex items-center gap-2 mb-2">
              <Image src={image} alt="preview" className="w-16 h-16 object-cover rounded shadow" width={64} height={64} />
              <button type="button" onClick={removeImage} className="text-red-500 hover:underline text-sm">Remove</button>
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex items-center cursor-pointer px-2 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={aiTyping}
              />
              <span role="img" aria-label="Upload image">🖼️</span>
            </label>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 p-2 border rounded focus:outline-none focus:ring"
              placeholder="Type your message..."
              disabled={aiTyping}
              maxLength={500}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              disabled={aiTyping || (!input.trim() && !image)}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

// Dummy AI reply generator
function getFakeAiReply(userMsg: string) {
  const replies = [
    "That's interesting! Tell me more.",
    "How can I assist you further?",
    "Can you elaborate on that?",
    "I'm here to help!",
    "Let's talk about something else.",
    `You said: "${userMsg}"`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
} 