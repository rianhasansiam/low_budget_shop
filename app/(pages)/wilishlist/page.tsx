import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist | EngineersGadget",
  description: "View and manage your saved items. Save your favorite gadgets and get notified about price drops and deals.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistPage() {
  return <WishlistClient />;
}