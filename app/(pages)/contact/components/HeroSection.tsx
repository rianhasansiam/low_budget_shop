"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-gray-900 to-black text-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Get In Touch
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg text-gray-300 max-w-2xl mx-auto"
        >
          Have questions about our tech gadgets? We&apos;re here to help!
          Reach out to us through any of the channels below.
        </motion.p>
      </div>
    </section>
  );
}
