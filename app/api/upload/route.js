import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkAdminAuth, validateImageFile, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/auth';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

// Ensure upload directory exists
function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'events');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// POST - Handle image upload (PROTECTED - Admin only)
export async function POST(request) {
  try {
    // Require admin authentication
    const { isAdmin, error } = await checkAdminAuth();
    if (!isAdmin) {
      return error;
    }

    const formData = await request.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    
    // Validate file type and size
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Additional check: verify file magic bytes (first few bytes indicate file type)
    const magicBytes = buffer.slice(0, 4);
    const isValidImage = 
      // JPEG
      (magicBytes[0] === 0xFF && magicBytes[1] === 0xD8 && magicBytes[2] === 0xFF) ||
      // PNG
      (magicBytes[0] === 0x89 && magicBytes[1] === 0x50 && magicBytes[2] === 0x4E && magicBytes[3] === 0x47) ||
      // GIF
      (magicBytes[0] === 0x47 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46) ||
      // WebP (RIFF....WEBP)
      (magicBytes[0] === 0x52 && magicBytes[1] === 0x49 && magicBytes[2] === 0x46 && magicBytes[3] === 0x46);
    
    if (!isValidImage) {
      return NextResponse.json({ 
        error: 'Invalid image file. File content does not match a valid image format.' 
      }, { status: 400 });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    // Get extension safely
    const originalName = file.name || 'image.png';
    const ext = path.extname(originalName).toLowerCase() || '.png';
    
    // Ensure we only use allowed extensions in the filename
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.png';
    
    const filename = `${timestamp}_${randomString}${safeExt}`;
    
    // Save file
    const uploadDir = ensureUploadDir();
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    // Return the public path
    const publicPath = `/events/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      imagePath: publicPath,
      filename: filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
