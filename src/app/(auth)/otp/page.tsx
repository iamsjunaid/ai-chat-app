"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { setOtp, setAuthenticated } from "@/features/auth/authSlice";
import toast from "react-hot-toast";

const schema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type FormData = z.infer<typeof schema>;

export default function OtpPage() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const phone = useSelector((state: RootState) => state.auth.phone);
  const country = useSelector((state: RootState) => state.auth.country);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { otp: "" },
  });

  const onSubmit = (data: FormData) => {
    setLoading(true);
    dispatch(setOtp(data.otp));
    // Simulate OTP check
    setTimeout(() => {
      setLoading(false);
      if (data.otp === "123456") {
        dispatch(setAuthenticated(true));
        toast.success("OTP verified! Redirecting...");
        router.push("/dashboard");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    }, 1000);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Enter OTP</h1>
        <p className="mb-4 text-center text-gray-500 text-sm">
          Enter the 6-digit OTP sent to <span className="font-semibold">{country} {phone}</span>
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">OTP</label>
            <input
              type="text"
              maxLength={6}
              {...register("otp")}
              className="w-full p-2 border rounded focus:outline-none focus:ring tracking-widest text-center text-lg font-mono"
              placeholder="Enter OTP"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
            {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </main>
  );
} 