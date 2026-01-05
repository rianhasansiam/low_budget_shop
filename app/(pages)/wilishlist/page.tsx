import type { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist | BlackBerry",
  description: "View and manage your saved items.",
};

export default function WishlistPage() {
  return <WishlistClient />;
}