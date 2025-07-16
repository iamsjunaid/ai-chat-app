"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { addChatroom, deleteChatroom, setChatrooms, Chatroom } from "@/features/chatrooms/chatroomsSlice";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import Link from "next/link";

const schema = z.object({
  title: z.string().min(2, "Title is too short").max(32, "Title is too long"),
});

type FormData = z.infer<typeof schema>;

const CHATROOMS_KEY = "chatrooms";
const DARK_MODE_KEY = "darkMode";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const chatrooms = useSelector((state: RootState) => state.chatrooms.chatrooms);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<Chatroom[]>(chatrooms);
  const [darkMode, setDarkMode] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Route protection
  useEffect(() => {
    setCheckingAuth(true);
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [isAuthenticated, router]);

  // Load chatrooms from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CHATROOMS_KEY);
    if (stored) {
      try {
        dispatch(setChatrooms(JSON.parse(stored)));
      } catch {}
    }
    // Load dark mode preference
    const dm = localStorage.getItem(DARK_MODE_KEY);
    if (dm === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, [dispatch]);

  // Sync chatrooms to localStorage
  useEffect(() => {
    localStorage.setItem(CHATROOMS_KEY, JSON.stringify(chatrooms));
  }, [chatrooms]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltered(
        chatrooms.filter((room) =>
          room.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    }, 250);
    return () => clearTimeout(handler);
  }, [search, chatrooms]);

  // Dark mode toggle
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem(DARK_MODE_KEY, next ? "true" : "false");
      return next;
    });
  }, []);

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

  if (checkingAuth) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center min-h-[300px]">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></span>
          <span className="text-lg">Checking authentication...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-center sm:text-left">Your Chatrooms</h1>
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring"
          placeholder="Search chatrooms..."
        />
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
          {filtered.length === 0 ? (
            <li className="py-8 text-center text-gray-500">No chatrooms found.</li>
          ) : (
            filtered.map((room) => (
              <li key={room.id} className="flex items-center justify-between py-4 group">
                <Link
                  href={`/chatroom`}
                  className="flex-1 font-medium hover:underline focus:underline outline-none transition text-left cursor-pointer group-hover:text-blue-600 group-focus:text-blue-600"
                  tabIndex={0}
                >
                  {room.title}
                </Link>
                <button
                  onClick={() => onDelete(room.id)}
                  className="text-red-500 hover:text-red-700 px-3 py-1 rounded transition border border-red-200 dark:border-red-700 ml-2"
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