import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile | EngineersGadget",
  description: "Manage your EngineersGadget account settings, personal information, and preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
