import type { Metadata } from "next";
import { Suspense } from "react";
import SignupClient from "./SignupClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up | EngineersGadget",
  description: "Create your EngineersGadget account to start shopping premium tech gadgets with exclusive offers and fast delivery.",
  robots: {
    index: false,
    follow: true,
  },
};

function SignupFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupClient />
    </Suspense>
  );
}