import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | EngineersGadget",
  description: "Admin dashboard for managing EngineersGadget store.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
