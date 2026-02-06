import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders | EngineersGadget",
  description: "Track and manage your orders at EngineersGadget. View order history, shipping status, and delivery details.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
