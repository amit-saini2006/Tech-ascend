"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Tech <span className="text-purple-400">Ascend</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/events" 
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium relative group"
            >
              Events
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium relative group"
            >
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
                  Register Now
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/admin" 
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                Dashboard
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900"
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
          <div className="flex flex-col space-y-3 pt-4 border-t border-purple-800/50">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/events" 
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium px-2 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex flex-col space-y-3 pt-3 border-t border-purple-800/50">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-gray-300 hover:text-white transition-colors duration-300 font-medium px-2 py-2 text-left">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full font-medium text-center">
                    Register Now
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/admin" 
                  className="text-gray-300 hover:text-white transition-colors duration-300 font-medium px-2 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="px-2 py-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;