"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function MapSection() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Find Our Store</h2>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-gray-200 rounded-2xl h-[400px] flex items-center justify-center overflow-hidden"
      >
        {/* Replace with actual map integration (Google Maps, Mapbox, etc.) */}
        <div className="text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-600 font-medium">
            123 Tech Street, Dhaka, Bangladesh 1205
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Map integration coming soon
          </p>
        </div>
      </motion.div>

      {/* Additional Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 bg-gray-50 rounded-2xl p-6"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Response Guarantee
        </h3>
        <p className="text-gray-600">
          We typically respond to all inquiries within 24 hours during business
          days. For urgent matters, please call us directly.
        </p>
      </motion.div>
    </motion.div>
  );
}
