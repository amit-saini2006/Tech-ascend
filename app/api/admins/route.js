import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { auth, currentUser } from '@clerk/nextjs/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Path to admins data file
const dataFilePath = path.join(process.cwd(), 'data', 'admins.json');

// Ensure data file exists with default values
function ensureDataFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    // Get initial admins from environment variables
    const envAdmins = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
    const superAdmin = envAdmins.length > 0 ? envAdmins[0] : "";
    
    const defaultData = {
      superAdmin: superAdmin,
      admins: envAdmins
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2));
  }
}

// Get admin data
function getAdminData() {
  ensureDataFile();
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
}

// Save admin data
function saveAdminData(data) {
  ensureDataFile();
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Check if email is an admin
function isAdmin(email) {
  const data = getAdminData();
  return data.admins.includes(email.toLowerCase());
}

// Check if email is super admin
function isSuperAdmin(email) {
  const data = getAdminData();
  return data.superAdmin.toLowerCase() === email.toLowerCase();
}

// Auth check helper
async function checkCurrentUserAdmin() {
  const { userId } = await auth();
  if (!userId) {
    return { authorized: false, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  
  const user = await currentUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  
  if (!userEmail || !isAdmin(userEmail)) {
    return { authorized: false, error: NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 }) };
  }
  
  return { authorized: true, userEmail, user };
}

// GET - Get all admins (admin only)
export async function GET() {
  try {
    const authCheck = await checkCurrentUserAdmin();
    if (!authCheck.authorized) return authCheck.error;
    
    const data = getAdminData();
    return NextResponse.json({ 
      admins: data.admins,
      superAdmin: data.superAdmin
    });
  } catch (error) {
    console.error('GET admins error:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// POST - Add a new admin (admin only)
export async function POST(request) {
  try {
    const authCheck = await checkCurrentUserAdmin();
    if (!authCheck.authorized) return authCheck.error;
    
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const data = getAdminData();
    
    // Check if already an admin
    if (data.admins.includes(normalizedEmail)) {
      return NextResponse.json({ error: 'User is already an admin' }, { status: 409 });
    }
    
    // Add new admin
    data.admins.push(normalizedEmail);
    saveAdminData(data);
    
    return NextResponse.json({ 
      success: true, 
      message: `${normalizedEmail} has been added as admin`,
      admins: data.admins
    }, { status: 201 });
  } catch (error) {
    console.error('POST admin error:', error);
    return NextResponse.json({ error: 'Failed to add admin' }, { status: 500 });
  }
}

// DELETE - Remove an admin (admin only, cannot remove super admin)
export async function DELETE(request) {
  try {
    const authCheck = await checkCurrentUserAdmin();
    if (!authCheck.authorized) return authCheck.error;
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const data = getAdminData();
    
    // Cannot remove super admin
    if (normalizedEmail === data.superAdmin.toLowerCase()) {
      return NextResponse.json({ 
        error: 'Cannot remove super admin. This account is protected.' 
      }, { status: 403 });
    }
    
    // Check if user is an admin
    const index = data.admins.findIndex(a => a.toLowerCase() === normalizedEmail);
    if (index === -1) {
      return NextResponse.json({ error: 'User is not an admin' }, { status: 404 });
    }
    
    // Remove admin
    data.admins.splice(index, 1);
    saveAdminData(data);
    
    return NextResponse.json({ 
      success: true, 
      message: `${normalizedEmail} has been removed from admin`,
      admins: data.admins
    });
  } catch (error) {
    console.error('DELETE admin error:', error);
    return NextResponse.json({ error: 'Failed to remove admin' }, { status: 500 });
  }
}
