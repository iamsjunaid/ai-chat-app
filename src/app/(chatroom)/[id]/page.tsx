"use client";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { addMessage, Message } from "@/features/messages/messagesSlice";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "next/navigation";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatroomPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.messages.messages.filter(m => m.chatroomId === id));
  const [input, setInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiTyping]);

  // Send user message and simulate AI reply
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: Message = {
      id: uuidv4(),
      chatroomId: id,
      sender: "user",
      content: input,
      timestamp: Date.now(),
    };
    dispatch(addMessage(userMsg));
    setInput("");
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

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[500px] flex flex-col">
        <h1 className="text-2xl font-bold mb-6 text-center">Chatroom</h1>
        <div className="flex-1 overflow-y-auto mb-4 px-1" style={{ maxHeight: 400 }}>
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">No messages yet. Say hello!</div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-2`}>
              <div className={`rounded-lg px-4 py-2 max-w-xs break-words ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"}`}>
                <div>{msg.content}</div>
                <div className="text-xs text-gray-300 dark:text-gray-400 mt-1 text-right">{formatTime(msg.timestamp)}</div>
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
        <form onSubmit={sendMessage} className="flex gap-2 mt-auto">
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
            disabled={aiTyping || !input.trim()}
          >
            Send
          </button>
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