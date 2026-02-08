import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkAdminAuth } from '@/lib/auth';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

// Path to settings file
const dataFilePath = path.join(process.cwd(), 'data', 'settings.json');

// Ensure data directory and file exist
function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    const defaultSettings = {
      registrationOpen: true
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultSettings, null, 2));
  }
}

// Get settings
function getSettings() {
  ensureDataFile();
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading settings:', error);
    return { registrationOpen: true };
  }
}

// Save settings
function saveSettings(settings) {
  ensureDataFile();
  fs.writeFileSync(dataFilePath, JSON.stringify(settings, null, 2));
}

// GET - Fetch settings (Public)
export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('GET settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST - Update settings (Protected - Admin only)
export async function POST(request) {
  try {
    // Require admin authentication
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) {
      return error;
    }

    const body = await request.json();
    const currentSettings = getSettings();
    
    // Update settings
    const newSettings = {
      ...currentSettings,
      ...body
    };
    
    saveSettings(newSettings);
    
    return NextResponse.json({ 
      success: true, 
      settings: newSettings 
    });
  } catch (error) {
    console.error('POST settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
