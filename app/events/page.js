"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // Fetch user registrations
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) return;

        const response = await fetch(`/api/registrations?email=${encodeURIComponent(email)}`);
        if (response.ok) {
          const data = await response.json();
          const registeredIds = new Set(data.registrations.map(reg => reg.eventId));
          setRegisteredEventIds(registeredIds);
        }
      } catch (error) {
        console.error('Error fetching registrations:', error);
      }
    };

    fetchRegistrations();
  }, [isLoaded, isSignedIn, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-16 flex items-center justify-center">
        <div className="text-white text-xl">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Events</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Register for exciting tech events, competitions, and workshops. Showcase your skills and learn from the best!
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div 
              key={event.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 group flex flex-col h-full"
            >
              {/* Event Image/Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                {event.imagePath ? (
                  <img src={event.imagePath} alt={event.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-3xl">{event.image}</span>
                )}
              </div>

              {/* Category Badge */}
              <span className="inline-block px-3 py-1 text-sm font-medium text-purple-400 bg-purple-500/10 rounded-full mb-3">
                {event.category}
              </span>

              {/* Event Name */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300">
                {event.name}
              </h3>

              {/* Event Description */}
              <p className="text-gray-400 mb-4 text-sm leading-relaxed line-clamp-2">
                {event.description}
              </p>

              {/* Event Date */}
              <div className="flex items-center text-gray-500 mb-4">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">{event.date}</span>
              </div>

              {/* Register Button */}
            {/* Register Button or Status Badge */}
            {(() => {
              const isExpired = event.deadline && new Date(event.deadline) < new Date();
              const isClosed = !event.registrationOpen || isExpired;

              if (registeredEventIds.has(event.id)) {
                return (
                  <Link 
                    href={`/events/${event.id}`}
                    className="block w-full bg-green-600/20 border border-green-500/50 text-green-400 py-3 rounded-xl font-medium hover:bg-green-600/30 transition-all duration-300 flex items-center justify-center gap-2 mt-auto"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Registered - View Details
                  </Link>
                );
              }

              if (isClosed) {
                return (
                  <button
                    disabled
                    className="block w-full bg-slate-700/50 border border-slate-600 text-gray-400 py-3 rounded-xl font-medium cursor-not-allowed mt-auto"
                  >
                    {isExpired ? 'Registration Ended' : 'Registration Closed'}
                  </button>
                );
              }

              return (
                <Link 
                  href={`/events/${event.id}`}
                  className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-center mt-auto"
                >
                  Register Now
                </Link>
              );
            })()}
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
