"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, LucideIcon } from "lucide-react";

// Demo contact information
const contactInfo: {
  icon: LucideIcon;
  title: string;
  details: string;
  subDetails: string;
}[] = [
  {
    icon: Mail,
    title: "Email Us",
    details: "support@bberrybd.com",
    subDetails: "sales@bberrybd.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+880 1234-567890",
    subDetails: "+880 1234-567891",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "123 Tech Street",
    subDetails: "Dhaka, Bangladesh 1205",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: "Mon - Fri: 9AM - 6PM",
    subDetails: "Sat - Sun: 10AM - 4PM",
  },
];

export default function ContactInfoCards() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4"
              >
                <info.icon className="w-6 h-6 text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {info.title}
              </h3>
              <p className="text-gray-700">{info.details}</p>
              <p className="text-gray-500 text-sm">{info.subDetails}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
