import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Shopping Cart | EngineersGadget",
  description: "Review items in your shopping cart and proceed to checkout.",
};

export default function CartPage() {
  return <CartClient />;
}