import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkAdminAuth } from '@/lib/auth';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

// Path to store events
const dataFilePath = path.join(process.cwd(), 'data', 'events.json');

// Ensure data directory and file exist
function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    // Default event data
    const defaultEvents = [
      {
        id: 1,
        name: "BugHunt",
        tagline: "Hunt the bugs, claim the glory!",
        description: "BugHunt is an exciting debugging competition where participants race against time to find and fix bugs in code.",
        image: "🐛",
        imagePath: null,
        date: "March 15, 2026",
        time: "10:00 AM - 6:00 PM",
        duration: "8 Hours",
        mode: "Hybrid",
        location: "CS Lab 101 & Online",
        category: "Competition",
        teamSize: "Individual or Team of 2",
        registrationDeadline: "March 10, 2026",
        prizes: ["1st Place: ₹5,000", "2nd Place: ₹3,000", "3rd Place: ₹2,000"],
        requirements: ["Laptop with IDE", "Basic programming knowledge", "GitHub account"],
        highlights: ["Multiple difficulty levels", "Real-world bug scenarios", "Industry mentors", "Certificates for all"]
      }
    ];
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultEvents, null, 2));
  }
}

// Get all events
function getEvents() {
  ensureDataFile();
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
}

// Save events
function saveEvents(events) {
  ensureDataFile();
  fs.writeFileSync(dataFilePath, JSON.stringify(events, null, 2));
}

// GET - Fetch all events or single event by ID (PUBLIC - anyone can view events)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const events = getEvents();
    
    if (id) {
      const event = events.find(e => e.id === parseInt(id));
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ event });
    }
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('GET events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// PUT - Update an event (PROTECTED - Admin only)
export async function PUT(request) {
  try {
    // Require admin authentication
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) {
      return error;
    }

    const body = await request.json();
    const { id, ...eventData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }
    
    const events = getEvents();
    const eventIndex = events.findIndex(e => e.id === parseInt(id));
    
    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Sanitize string fields
    const sanitize = (str, maxLength = 500) => 
      str ? String(str).trim().slice(0, maxLength) : '';
    
    // Update event while preserving ID and sanitizing inputs
    events[eventIndex] = {
      ...events[eventIndex],
      ...eventData,
      id: parseInt(id),
      name: sanitize(eventData.name, 100),
      tagline: sanitize(eventData.tagline, 200),
      description: eventData.description ? String(eventData.description).trim() : '',
    };
    
    saveEvents(events);
    
    return NextResponse.json({ 
      success: true, 
      event: events[eventIndex] 
    });
  } catch (error) {
    console.error('PUT event error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

// POST - Create a new event (PROTECTED - Admin only)
export async function POST(request) {
  try {
    // Require admin authentication
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) {
      return error;
    }

    const body = await request.json();
    const events = getEvents();
    
    // Generate new ID
    const maxId = events.length > 0 ? Math.max(...events.map(e => e.id)) : 0;
    
    const newEvent = {
      id: maxId + 1,
      name: body.name || 'New Event',
      tagline: body.tagline || '',
      description: body.description || '',
      image: body.image || '📅',
      imagePath: body.imagePath || null,
      date: body.date || '',
      time: body.time || '',
      duration: body.duration || '',
      mode: body.mode || 'Offline',
      location: body.location || '',
      category: body.category || '',
      teamSize: body.teamSize || 'Individual',
      registrationDeadline: body.registrationDeadline || '', // Text display
      deadline: body.deadline || '', // ISO string for logic
      registrationOpen: body.registrationOpen !== undefined ? body.registrationOpen : true, // Boolean toggle
      prizes: body.prizes || [],
      requirements: body.requirements || [],
      highlights: body.highlights || []
    };
    
    events.push(newEvent);
    saveEvents(events);
    
    return NextResponse.json({ 
      success: true, 
      event: newEvent 
    }, { status: 201 });
  } catch (error) {
    console.error('POST event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

// DELETE - Delete an event (PROTECTED - Admin only)
export async function DELETE(request) {
  try {
    // Require admin authentication
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) {
      return error;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 });
    }
    
    const events = getEvents();
    const eventIndex = events.findIndex(e => e.id === parseInt(id));
    
    if (eventIndex === -1) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    events.splice(eventIndex, 1);
    saveEvents(events);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE event error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
