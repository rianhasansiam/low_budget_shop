import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd";

export const metadata: Metadata = {
  title: "All Products - Shop Tech Gadgets & Electronics",
  description:
    "Browse our complete collection of tech gadgets, Arduino, Raspberry Pi, sensors, microcontrollers, IoT devices, and engineering tools. Best prices with fast shipping.",
  keywords: [
    "tech gadgets",
    "Arduino",
    "Raspberry Pi",
    "sensors",
    "microcontrollers",
    "IoT devices",
    "engineering tools",
    "electronic components",
    "robotics",
  ],
  openGraph: {
    title: "All Products | EngineersGadget",
    description:
      "Browse our complete collection of tech gadgets and engineering tools. Best prices with fast shipping.",
    type: "website",
    url: `${siteUrl}/allProducts`,
    siteName: "EngineersGadget",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products | EngineersGadget",
    description:
      "Browse our complete collection of tech gadgets and engineering tools. Best prices with fast shipping.",
  },
  alternates: {
    canonical: `${siteUrl}/allProducts`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AllProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
