import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkAdminAuth, checkAuth } from '@/lib/auth';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

// Path to store registrations (using a JSON file for simplicity)
const dataFilePath = path.join(process.cwd(), 'data', 'registrations.json');

// Ensure data directory and file exist
function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
  }
}

// Get all registrations
function getRegistrations() {
  ensureDataFile();
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
}

// Save registrations
function saveRegistrations(registrations) {
  ensureDataFile();
  fs.writeFileSync(dataFilePath, JSON.stringify(registrations, null, 2));
}

// GET - Fetch all registrations (PROTECTED - Admin only for full list)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const eventId = searchParams.get('eventId');
    
    // If checking specific user registration - allow without admin auth
    // (users can check if they're already registered)
    if (email && eventId) {
      const registrations = getRegistrations();
      const isRegistered = registrations.some(
        reg => reg.email === email && reg.eventId === parseInt(eventId)
      );
      return NextResponse.json({ isRegistered });
    }
    
    // Check if user is authenticated
    const authCheck = await checkAuth();
    
    // If requesting own registrations (email provided matches logged in user)
    if (email && !eventId) {
      if (!authCheck.isAuthenticated) {
        return authCheck.error;
      }
      
      const userEmail = authCheck.user.primaryEmailAddress.emailAddress.toLowerCase();
      if (email.toLowerCase() !== userEmail) {
        return NextResponse.json({ error: 'Forbidden - Can only view own registrations' }, { status: 403 });
      }
      
      const registrations = getRegistrations();
      const userRegistrations = registrations.filter(r => r.email === email.toLowerCase());
      return NextResponse.json({ registrations: userRegistrations });
    }

    // For full registration list (admin) or other queries
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) {
      return error;
    }
    
    const registrations = getRegistrations();
    return NextResponse.json({ registrations });
  } catch (error) {
    console.error('GET registrations error:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

// POST - Create new registration (PUBLIC - anyone can register)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, course, year, college, phone, eventId, eventName } = body;
    
    // Input validation
    if (!name || !email || !eventId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    // Sanitize inputs
    const sanitize = (str) => str ? String(str).trim().slice(0, 200) : '';
    
    const registrations = getRegistrations();
    
    // Check if already registered
    const existingRegistration = registrations.find(
      reg => reg.email === email && reg.eventId === eventId
    );
    
    if (existingRegistration) {
      return NextResponse.json({ 
        error: 'Already registered', 
        alreadyRegistered: true 
      }, { status: 409 });
    }
    
    // Create new registration with sanitized data
    const newRegistration = {
      id: Date.now(),
      name: sanitize(name),
      email: sanitize(email).toLowerCase(),
      course: sanitize(course) || 'Not specified',
      year: sanitize(year) || 'Not specified',
      college: sanitize(college) || 'Not specified',
      phone: sanitize(phone) || 'Not provided',
      eventId: parseInt(eventId),
      eventName: sanitize(eventName) || 'Unknown Event',
      registeredAt: new Date().toISOString()
    };
    
    registrations.push(newRegistration);
    saveRegistrations(registrations);
    
    return NextResponse.json({ 
      success: true, 
      registration: newRegistration 
    }, { status: 201 });
  } catch (error) {
    console.error('POST registration error:', error);
    return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
  }
}

// DELETE - Remove a registration (PROTECTED - Admin only)
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
      return NextResponse.json({ error: 'Missing registration ID' }, { status: 400 });
    }
    
    const registrations = getRegistrations();
    const index = registrations.findIndex(reg => reg.id === parseInt(id));
    
    if (index === -1) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    
    registrations.splice(index, 1);
    saveRegistrations(registrations);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE registration error:', error);
    return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
  }
}
