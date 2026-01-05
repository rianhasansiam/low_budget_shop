import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | BlackBerry",
  description: "Complete your purchase securely. Fast and reliable checkout process.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
