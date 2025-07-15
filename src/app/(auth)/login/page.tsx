"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { CountrySelector } from "@/components/auth/CountrySelector";
import { fetchCountries } from "@/lib/api";
import { setPhone, setCountry } from "@/features/auth/authSlice";
import { Country } from "@/features/auth/types";

const schema = z.object({
  country: z.string().min(1, "Country is required"),
  phone: z.string().min(6, "Phone is too short").max(15, "Phone is too long"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: "", phone: "" },
  });

  useEffect(() => {
    fetchCountries().then((data) => {
      setCountries(data);
      setLoading(false);
    });
  }, []);

  const onSubmit = (data: FormData) => {
    dispatch(setCountry(data.country));
    dispatch(setPhone(data.phone));
    // Simulate OTP send
    setTimeout(() => {
      router.push("/otp");
    }, 800);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Login / Signup</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Country</label>
            {loading ? (
              <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            ) : (
              <CountrySelector
                countries={countries}
                value={watch("country")}
                onChange={(code) => setValue("country", code)}
              />
            )}
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone Number</label>
            <input
              type="tel"
              {...register("phone")}
              className="w-full p-2 border rounded focus:outline-none focus:ring"
              placeholder="Enter your phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Send OTP"}
          </button>
        </form>
      </div>
    </main>
  );
} 