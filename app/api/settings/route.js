import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { checkAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const setting = await Setting.findOne({ key: 'registrationOpen' }).lean();
    return NextResponse.json({ 
      registrationOpen: setting ? setting.value : true 
    });
  } catch (error) {
    return NextResponse.json({ registrationOpen: true });
  }
}

export async function POST(request) {
  try {
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) return error;

    await dbConnect();
    const { registrationOpen } = await request.json();
    
    await Setting.findOneAndUpdate(
      { key: 'registrationOpen' },
      { $set: { value: registrationOpen } },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, registrationOpen });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
