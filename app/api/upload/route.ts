import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // If Supabase is configured, upload to storage bucket
    if (supabaseUrl && !supabaseUrl.includes('dummy') && !supabaseUrl.includes('placeholder')) {
      const supabase = createClient();
      const filename = `complaint_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      
      const { data, error } = await supabase.storage
        .from('complaint-images')
        .upload(filename, file, { upsert: true });

      if (error) {
        console.warn('Supabase storage upload failed, falling back to data URL:', error);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('complaint-images')
          .getPublicUrl(data.path);
        
        return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
      }
    }

    // High quality data URL fallback for client demonstration
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
