"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { addChatroom, deleteChatroom, setChatrooms, Chatroom } from "@/features/chatrooms/chatroomsSlice";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const schema = z.object({
  title: z.string().min(2, "Title is too short").max(32, "Title is too long"),
});

type FormData = z.infer<typeof schema>;

const CHATROOMS_KEY = "chatrooms";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const chatrooms = useSelector((state: RootState) => state.chatrooms.chatrooms);

  // Load chatrooms from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CHATROOMS_KEY);
    if (stored) {
      try {
        dispatch(setChatrooms(JSON.parse(stored)));
      } catch {}
    }
  }, [dispatch]);

  // Sync chatrooms to localStorage
  useEffect(() => {
    localStorage.setItem(CHATROOMS_KEY, JSON.stringify(chatrooms));
  }, [chatrooms]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: "" },
  });

  const onCreate = (data: FormData) => {
    const newChatroom: Chatroom = {
      id: uuidv4(),
      title: data.title,
      createdAt: Date.now(),
    };
    dispatch(addChatroom(newChatroom));
    toast.success("Chatroom created!");
    reset();
  };

  const onDelete = (id: string) => {
    dispatch(deleteChatroom(id));
    toast.success("Chatroom deleted!");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Chatrooms</h1>
        <form onSubmit={handleSubmit(onCreate)} className="flex gap-2 mb-6">
          <input
            type="text"
            {...register("title")}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring"
            placeholder="New chatroom title"
            maxLength={32}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Create
          </button>
        </form>
        {errors.title && <p className="text-red-500 text-sm mb-4">{errors.title.message}</p>}
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {chatrooms.length === 0 ? (
            <li className="py-8 text-center text-gray-500">No chatrooms yet.</li>
          ) : (
            chatrooms.map((room) => (
              <li key={room.id} className="flex items-center justify-between py-4">
                <span className="font-medium">{room.title}</span>
                <button
                  onClick={() => onDelete(room.id)}
                  className="text-red-500 hover:text-red-700 px-3 py-1 rounded transition border border-red-200 dark:border-red-700"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  );
} 