"use client";
import { RootState } from "@/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Home() {

  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Route protection
  useEffect(() => {
    setCheckingAuth(true);
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [isAuthenticated, router]);

  if (!checkingAuth) {
    return (
      <div>
        <h1>You&apos;re not logged in please</h1>
        <Link href="/login">Login</Link>
      </div>
    );
  }
}