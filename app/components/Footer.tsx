"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Demo social media data
const socialsData = [
  {
    id: 1,
    name: 'Facebook',
    url: 'https://www.facebook.com/share/1CDT5uopnd/',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 2,
    name: 'Instagram',
    url: 'https://www.instagram.com/engineers_gadget?igsh=MTJia3RwN3NsNHRudw==',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    id: 3,
    name: 'TikTok',
    url: 'https://www.tiktok.com/@engineers.gadget?_r=1&_t=ZS-92uD7YRDP5k',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
  {
    id: 4,
    name: 'Youtube',
    url: 'https://youtube.com/@engineersgadget-e3e?si=ZiroQXwcJjyr6qQU',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 5,
    name: 'WhatsApp',
    url: 'https://wa.me/8801621420608',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
];

// Demo footer links data
const footerLinksData = [
  {
    id: 1,
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Features', href: '/features' },
      { name: 'Works', href: '/works' },
      { name: 'Career', href: '/career' },
    ],
  },
  {
    id: 2,
    title: 'Help',
    links: [
      { name: 'Customer Support', href: '/support' },
      { name: 'Delivery Details', href: '/delivery' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  },
  {
    id: 3,
    title: 'FAQ',
    links: [
      { name: 'Account', href: '/faq/account' },
      { name: 'Manage Deliveries', href: '/faq/deliveries' },
      { name: 'Orders', href: '/faq/orders' },
      { name: 'Payments', href: '/faq/payments' },
    ],
  },
  {
    id: 4,
    title: 'Resources',
    links: [
      { name: 'Free eBooks', href: '/resources/ebooks' },
      { name: 'Development Tutorial', href: '/resources/tutorials' },
      { name: 'How to - Blog', href: '/blog' },
      { name: 'Youtube Playlist', href: '/resources/youtube' },
    ],
  },
];

// Links Section Component
const LinksSection = () => {
  return (
    <>
      {footerLinksData.map((section, sectionIndex) => (
        <motion.div 
          key={section.id} 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: sectionIndex * 0.1, duration: 0.5 }}
          className="mb-6 sm:mb-8 lg:mb-0"
        >
          <h2 className="text-white font-medium tracking-wider mb-3 sm:mb-4 text-xs sm:text-sm uppercase">
            {section.title}
          </h2>
          <ul className="space-y-2 sm:space-y-3">
            {section.links.map((link, index) => (
              <motion.li 
                key={index}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={link.href}
                  className="text-white/60 hover:text-white text-xs sm:text-sm transition-colors duration-200 block py-0.5"
                >
                  {link.name}
                </Link>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      ))}
    </>
  );
};

// Layout Spacing Component
const LayoutSpacing = () => {
  return <div className="h-4" />;
};








const Footer = () => {
  return (
    <footer className="bg-black" role="contentinfo" aria-label="Site footer">
      {/* Schema.org Organization structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Engineers Gadget',
            url: 'https://engineersgadget.com.bd',
            logo: 'https://engineersgadget.com.bd/logo.png',
            sameAs: [
              'https://www.facebook.com/share/1CDT5uopnd/',
              'https://www.instagram.com/engineers_gadget?igsh=MTJia3RwN3NsNHRudw==',
              'https://www.tiktok.com/@engineers.gadget?_r=1&_t=ZS-92uD7YRDP5k',
              'https://youtube.com/@engineersgadget-e3e?si=ZiroQXwcJjyr6qQU',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+880-1621-420608',
              contactType: 'customer service',
              email: 'engineersgadet25@gmail.com',
              availableLanguage: ['English', 'Bengali'],
              areaServed: 'BD',
            },
          }),
        }}
      />
      <div className="pt-6 sm:pt-8 md:pt-12 lg:pt-[50px] container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4">
        <div className="max-w-7xl mx-auto">
          <nav className="lg:grid lg:grid-cols-12 gap-6 sm:gap-8 mb-6 sm:mb-8" aria-label="Footer navigation">
            {/* Brand Section */}
            <div className="flex flex-col lg:col-span-3 lg:max-w-[248px]">
              <Link href="/" className="flex items-center" aria-label="EngineersGadget - Home">
                {/* Using placeholder for logo - replace with actual logo */}
                <Image
                  src="/foot.png"
                  alt="Store Logo"
                  width={100}
                  height={100}
                  className="rounded-xl w-[120px] sm:w-[150px] lg:w-full h-auto mb-3 sm:mb-4"
                  priority
                />
              </Link>
              <p className="text-white/60 text-xs sm:text-sm mb-6 sm:mb-9 leading-relaxed max-w-[280px] sm:max-w-none">
                Engineers Gadget - Your trusted online gadget and electronics store in Bangladesh. Quality Gadget. Smart Price. Offering 100% original products with fast delivery nationwide.
              </p>
              <div className="flex items-center flex-wrap gap-1">
                {socialsData.map((social, index) => (
                  <motion.div
                    key={social.id}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link
                      href={social.url}
                      className="bg-white hover:bg-gray-200 hover:text-black transition-all w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/20 flex items-center justify-center p-1.5 sm:p-2 text-black"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${social.name}`}
                    >
                      {social.icon}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Links - Desktop */}
            <div className="hidden lg:grid col-span-9 lg:grid-cols-4 lg:pl-10 gap-4">
              <LinksSection />
            </div>

            {/* Links - Mobile/Tablet */}
            <div className="grid lg:hidden grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <LinksSection />
            </div>
          </nav>

          <hr className="h-px border-t-white/10 mb-4 sm:mb-6" />

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 sm:gap-0 mb-2">
            <p className="text-xs sm:text-sm text-center sm:text-left text-white/60">
              Engineers Gadget © {new Date().getFullYear()} Design and Developed by{' '}
              <Link
                href="https://www.byteblooper.com"
                className="text-white font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Byteblooper
              </Link>
              {', '}
              All rights reserved.
            </p>
         
          </div>
        </div>
        <LayoutSpacing />
      </div>
    </footer>
  );
};

export default Footer;
