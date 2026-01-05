"use client";

import React from 'react';
import { motion } from 'framer-motion';

const MissionSection = () => {
  const stats = [
    { value: "50K+", label: "Happy Customers" },
    { value: "10K+", label: "Products" },
    { value: "99%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-black font-semibold text-sm uppercase tracking-wider">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">
              Making Technology Accessible for Everyone
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              At BlackBerry, we&apos;re on a mission to democratize technology. 
              We believe that everyone deserves access to premium tech gadgets and electronics.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Through strategic partnerships with manufacturers and efficient operations, 
              we&apos;re able to offer products at prices that won&apos;t strain your wallet while 
              maintaining the quality standards you deserve.
            </p>
          </motion.div>
          
          {/* Visual Element */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-xl p-6 shadow-sm text-center border border-gray-200"
                  >
                    <div className="text-4xl font-bold text-black mb-2">{stat.value}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
