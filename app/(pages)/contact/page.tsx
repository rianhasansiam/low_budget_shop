import type { Metadata } from "next";
import HeroSection from "./components/HeroSection";
import ContactInfoCards from "./components/ContactInfoCards";
import ContactForm from "./components/ContactForm";
import MapSection from "./components/MapSection";
import FAQSection from "./components/FAQSection";

// SEO Metadata
export const metadata: Metadata = {
  title: "Contact Us | EngineersGadget - Tech Gadgets Store",
  description:
    "Get in touch with EngineersGadget. We're here to help with your tech gadget and engineering tools needs. Contact us via email, phone, or visit our store.",
  keywords: [
    "contact EngineersGadget",
    "tech gadget store contact",
    "customer support",
    "electronics help",
    "engineering tools support",
  ],
  openGraph: {
    title: "Contact Us | EngineersGadget",
    description:
      "Have questions? We'd love to hear from you. Reach out to EngineersGadget for all your tech gadget and engineering needs.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />
      <ContactInfoCards />
      
      {/* Contact Form & Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm />
            <MapSection />
          </div>
        </div>
      </section>

      <FAQSection />
    </main>
  );
}
