import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | EngineersGadget",
  description: "Complete your purchase securely. Multiple payment options including Cash on Delivery, bKash, and Nagad. Fast and reliable checkout.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
