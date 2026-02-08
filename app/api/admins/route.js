import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import { checkAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) return error;

    await dbConnect();
    const admins = await Admin.find({}).sort({ addedAt: -1 }).lean();
    return NextResponse.json({ admins: admins.map(a => a.email) });
  } catch (error) {
    console.error('GET admins error:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) return error;

    await dbConnect();
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    try {
      await Admin.create({ email: email.toLowerCase() });
    } catch (e) {
      if (e.code === 11000) {
        return NextResponse.json({ error: 'Admin already exists' }, { status: 409 });
      }
      throw e;
    }

    // Return updated list of admins
    const admins = await Admin.find({}).sort({ addedAt: -1 }).lean();
    return NextResponse.json({ 
      success: true, 
      admins: admins.map(a => a.email) 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add admin' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) return error;

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await Admin.findOneAndDelete({ email: email.toLowerCase() });
    
    // Return updated list of admins
    const admins = await Admin.find({}).sort({ addedAt: -1 }).lean();
    return NextResponse.json({ 
      success: true,
      admins: admins.map(a => a.email)
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove admin' }, { status: 500 });
  }
}
