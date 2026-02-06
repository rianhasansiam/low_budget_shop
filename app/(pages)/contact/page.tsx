import type { Metadata } from "next";
import HeroSection from "./components/HeroSection";
import ContactInfoCards from "./components/ContactInfoCards";
import ContactForm from "./components/ContactForm";
import FAQSection from "./components/FAQSection";
import { generateFAQSchema, generateBreadcrumbSchema, stringifySchema } from "@/lib/seo/structuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://engineersgadget.com.bd";

// FAQ data for structured data
const faqData = [
  {
    question: "What are your shipping options?",
    answer: "We offer standard (5-7 days), express (2-3 days), and overnight shipping options for all orders across Bangladesh.",
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 30 days of purchase for unused items in original packaging. Full refund or exchange available.",
  },
  {
    question: "Do you offer warranty?",
    answer: "All products come with manufacturer warranty. Extended warranty options are available at checkout.",
  },
  {
    question: "How can I track my order?",
    answer: "After placing your order, you will receive a tracking number via SMS and email. You can track your order on our website or contact customer support.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Cash on Delivery (COD), bKash, Nagad, and major credit/debit cards for secure online payments.",
  },
];

// SEO Metadata
export const metadata: Metadata = {
  title: "Contact Us | Engineers Gadget - Online Gadget Store in Bangladesh",
  description:
    "Get in touch with Engineers Gadget. Contact us for quality tech gadgets and electronics. Email: engineersgadet25@gmail.com | Phone: +880 1621420608 | WhatsApp available. Located in Dhaka, Bangladesh.",
  keywords: [
    "contact Engineers Gadget",
    "gadget store Bangladesh contact",
    "customer support",
    "tech support Bangladesh",
    "electronics help",
    "WhatsApp support",
    "gadget shop Dhaka",
  ],
  openGraph: {
    title: "Contact Us | Engineers Gadget",
    description:
      "Have questions? Contact Engineers Gadget for all your tech gadget needs in Bangladesh. Quality Gadget. Smart Price.",
    type: "website",
    url: `${siteUrl}/contact`,
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactPage() {
  // Generate structured data
  const faqSchema = generateFAQSchema(faqData);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact" },
  ]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifySchema(faqSchema) }}
      />
      
      {/* Breadcrumb Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifySchema(breadcrumbSchema) }}
      />
      
      <HeroSection />
      <ContactInfoCards />
      
      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </section>

      <FAQSection />
    </main>
  );
}
