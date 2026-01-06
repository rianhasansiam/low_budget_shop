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
    url: 'https://facebook.com',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 2,
    name: 'Twitter',
    url: 'https://twitter.com',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
  },
  {
    id: 3,
    name: 'Instagram',
    url: 'https://instagram.com',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    id: 4,
    name: 'GitHub',
    url: 'https://github.com',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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
            name: 'EngineersGadget',
            url: 'https://engineersgadget.tech',
            logo: 'https://engineersgadget.tech/logo.png',
            sameAs: [
              'https://facebook.com/engineersgadget',
              'https://twitter.com/engineersgadget',
              'https://instagram.com/engineersgadget',
              'https://github.com/engineersgadget',
              'https://linkedin.com/company/engineersgadget',
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              availableLanguage: 'English',
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
                We have products that suit your needs and which you&apos;re proud to
                own. Quality items at affordable prices for everyone.
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
              EngineersGadget © {new Date().getFullYear()} Made by{' '}
              <Link
                href="https://rianhasansiam.me"
                className="text-white font-medium hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Rian Hasan Siam
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
