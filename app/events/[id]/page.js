"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

const EventDetailPage = () => {
  const params = useParams();
  const eventId = parseInt(params.id);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events?id=${eventId}`);
        const data = await response.json();
        setEvent(data.event || null);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId]);

  // Check if already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      
      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;

        const response = await fetch(`/api/registrations?email=${encodeURIComponent(email)}&eventId=${eventId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.isRegistered) {
            setIsRegistered(true);
          }
        }
      } catch (error) {
        console.error('Error checking registration:', error);
      }
    };
    
    checkRegistration();
  }, [eventId, isLoaded, isSignedIn, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-16 flex items-center justify-center">
        <div className="text-white text-xl">Loading event...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Event Not Found</h1>
          <Link href="/events" className="text-purple-400 hover:text-purple-300">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          href="/events"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-300 mb-8"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-purple-500/20 overflow-hidden mb-8">
          {/* Hero Section */}
          <div 
            className="relative p-8 sm:p-12 text-center overflow-hidden min-h-[400px] flex flex-col justify-center items-center"
            style={{
              backgroundImage: event.imagePath ? `url(${event.imagePath})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay/Gradient Background */}
            <div className={`absolute inset-0 ${
              event.imagePath 
                ? 'bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40' 
                : 'bg-gradient-to-r from-purple-600/30 to-pink-600/30'
            }`}></div>

            {/* Content Container */}
            <div className="relative z-10 w-full">
              {!event.imagePath && (
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 overflow-hidden">
                    <span className="text-6xl">{event.image}</span>
                </div>
              )}
              
              <span className="inline-block px-4 py-1 text-sm font-medium text-purple-200 bg-purple-900/50 backdrop-blur-sm border border-purple-500/30 rounded-full mb-4">
                {event.category}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                {event.name}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-200 italic max-w-3xl mx-auto drop-shadow-md">{event.tagline}</p>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 border-b border-purple-500/20">
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-purple-400 mb-1">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-xs mb-1">Date</p>
              <p className="text-white font-medium text-sm">{event.date}</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-purple-400 mb-1">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-xs mb-1">Duration</p>
              <p className="text-white font-medium text-sm">{event.duration}</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-purple-400 mb-1">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-xs mb-1">Mode</p>
              <p className="text-white font-medium text-sm">{event.mode}</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-xl">
              <div className="text-purple-400 mb-1">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-xs mb-1">Team Size</p>
              <p className="text-white font-medium text-sm">{event.teamSize}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* About */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">📋</span>
                About the Event
              </h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* Time & Location */}
              <div className="bg-slate-700/30 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">📍 Venue & Timing</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white">{event.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span className="text-white">{event.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deadline</span>
                    <span className="text-red-400">{event.registrationDeadline}</span>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-slate-700/30 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">📝 Requirements</h3>
                <ul className="space-y-2">
                  {event.requirements && event.requirements.map((req, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <span className="text-purple-400 mr-2">✓</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prizes */}
            {event.prizes && event.prizes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">🏆</span>
                  Prizes
                </h2>
                <div className="flex flex-wrap gap-3">
                  {event.prizes.map((prize, index) => (
                    <span key={index} className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-300 rounded-full text-sm font-medium">
                      {prize}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {event.highlights && event.highlights.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">✨</span>
                  Highlights
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {event.highlights.map((highlight, index) => (
                    <div key={index} className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                      <span className="text-purple-200 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Register Button */}
            <div className="text-center pt-4">
              {(() => {
                const isExpired = event.deadline && new Date(event.deadline) < new Date();
                const isClosed = !event.registrationOpen || isExpired;

                if (isRegistered) {
                  return (
                    <button
                      disabled
                      className="inline-flex bg-green-600/20 border border-green-500/50 text-green-400 px-10 py-4 rounded-full font-semibold text-lg cursor-not-allowed items-center justify-center gap-2 mx-auto"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Already Registered
                    </button>
                  );
                }

                if (isClosed) {
                  return (
                    <button
                      disabled
                      className="inline-block bg-slate-700/50 border border-slate-600 text-gray-400 px-10 py-4 rounded-full font-semibold text-lg cursor-not-allowed"
                    >
                      {isExpired ? 'Registration Ended' : 'Registration Closed'}
                    </button>
                  );
                }

                return (
                  <Link
                    href={`/events/${eventId}/register`}
                    className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-purple-500/30"
                  >
                    Register for {event.name}
                  </Link>
                );
              })()}
              
              <p className="text-gray-500 text-sm mt-4">
                Registration closes on {event.registrationDeadline}
                {event.deadline && (
                   <span className="block text-xs mt-1 text-gray-600">
                     (Automated closing at: {new Date(event.deadline).toLocaleString()})
                   </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
