import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Login | EngineersGadget",
  description: "Sign in to your EngineersGadget account to access your orders, wishlist, and personalized shopping experience.",
  robots: {
    index: false,
    follow: true,
  },
};

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}