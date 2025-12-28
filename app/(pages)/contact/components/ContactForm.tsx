"use client";

import { useState, useRef } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2";

// EmailJS configuration from environment variables
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formRef.current) return;

    // Validate EmailJS configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      Swal.fire({
        icon: "error",
        title: "Configuration Error",
        text: "Email service is not properly configured. Please contact the administrator.",
        confirmButtonColor: "#111827",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get form data
      const formData = new FormData(formRef.current);
      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      const email = formData.get("email") as string;
      const subject = formData.get("subject") as string;
      const message = formData.get("message") as string;

      // Format current date and time
      const now = new Date();
      const date = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Prepare template parameters matching your EmailJS template
      const templateParams = {
        name: `${firstName} ${lastName}`,
        email: email,
        message: `[${subject}]\n\n${message}`,
        date: date,
        time: time,
      };

      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (result.status === 200) {
        setIsSuccess(true);
        formRef.current.reset();

        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: "Thank you for contacting us. We'll get back to you soon.",
          confirmButtonColor: "#111827",
          timer: 3000,
          timerProgressBar: true,
        });

        // Reset success state after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      console.error("EmailJS Error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to Send",
        text: "There was an error sending your message. Please try again later.",
        confirmButtonColor: "#111827",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Send Us a Message
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              placeholder="John"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              placeholder="Doe"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
            placeholder="john@example.com"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
            required
            disabled={isSubmitting}
          >
            <option value="">Select a subject</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Product Support">Product Support</option>
            <option value="Order Status">Order Status</option>
            <option value="Returns & Refunds">Returns & Refunds</option>
            <option value="Wholesale Inquiry">Wholesale Inquiry</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none"
            placeholder="How can we help you?"
            required
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
            isSuccess
              ? "bg-green-600 text-white"
              : isSubmitting
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Message Sent!
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Message
            </>
          )}
        </button>
      </form>
    </div>
  );
}
