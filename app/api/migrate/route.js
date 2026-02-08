import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Registration from '@/models/Registration';
import Admin from '@/models/Admin';
import { checkAdminAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Security Check: Only admins can migrate
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) {
      return error;
    }

    await dbConnect();
    const dataDir = path.join(process.cwd(), 'data');
    const results = { events: 0, registrations: 0, admins: 0, settings: 0 };

    // 1. Migrate Events
    if (fs.existsSync(path.join(dataDir, 'events.json'))) {
      const events = JSON.parse(fs.readFileSync(path.join(dataDir, 'events.json'), 'utf8'));
      if (Array.isArray(events)) {
        for (const event of events) {
          // Use updateOne with upsert to avoid duplicates but ensure data
          await Event.updateOne(
            { id: event.id },
            { $set: event },
            { upsert: true }
          );
        }
        results.events = events.length;
      }
    }

    // 2. Migrate Registrations
    if (fs.existsSync(path.join(dataDir, 'registrations.json'))) {
      const regs = JSON.parse(fs.readFileSync(path.join(dataDir, 'registrations.json'), 'utf8'));
      if (Array.isArray(regs)) {
        for (const reg of regs) {
          await Registration.updateOne(
            { id: reg.id },
            { $set: reg },
            { upsert: true }
          );
        }
        results.registrations = regs.length;
      }
    }

    // 3. Migrate Admins
    if (fs.existsSync(path.join(dataDir, 'admins.json'))) {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'admins.json'), 'utf8'));
      if (data.admins && Array.isArray(data.admins)) {
        for (const email of data.admins) {
          await Admin.updateOne(
            { email: email.toLowerCase() },
            { $set: { email: email.toLowerCase() } },
            { upsert: true }
          );
        }
        results.admins = data.admins.length;
      }
    }

    // 4. Migrate Settings
    if (fs.existsSync(path.join(dataDir, 'settings.json'))) {
      const settings = JSON.parse(fs.readFileSync(path.join(dataDir, 'settings.json'), 'utf8'));
      // Settings might be an object { registrationOpen: true }
      for (const [key, value] of Object.entries(settings)) {
        await Setting.updateOne(
          { key },
          { $set: { value } },
          { upsert: true }
        );
      }
      results.settings = Object.keys(settings).length;
    }

    return NextResponse.json({ success: true, migrated: results });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: error.message }, { status: 500 });
  }
}
