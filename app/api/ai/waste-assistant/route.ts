import { NextRequest, NextResponse } from 'next/server';
import { analyzeWasteItemWithGroq } from '@/lib/groq/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, image_url } = body;

    const result = await analyzeWasteItemWithGroq(
      prompt || 'What waste category does this belong to?',
      image_url
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error in AI waste assistant API route:', error);
    return NextResponse.json({
      success: false,
      result: {
        item_detected: 'Identified Waste Item',
        category: 'Dry / Recyclable',
        disposal_instruction: 'Place in dry or recyclable waste bin.',
        helpful_tip: 'Segregate at source for efficient processing.',
      },
    });
  }
}
