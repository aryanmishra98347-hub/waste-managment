import { NextRequest, NextResponse } from 'next/server';
import { analyzeComplaintWithGroq } from '@/lib/groq/client';
import { IssueType } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { issue_type, description, image_url } = body;

    if (!issue_type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: issue_type and description' },
        { status: 400 }
      );
    }

    const aiAnalysis = await analyzeComplaintWithGroq(
      issue_type as IssueType,
      description,
      image_url
    );

    return NextResponse.json({ success: true, analysis: aiAnalysis });
  } catch (error) {
    console.error('Error in complaint analysis API route:', error);
    return NextResponse.json(
      {
        success: false,
        analysis: {
          category: 'Waste Report',
          waste_type: 'General Waste',
          severity: 'medium',
          summary: 'Report submitted by citizen.',
          recommended_action: 'Dispatch collection crew for inspection.',
        },
      },
      { status: 200 }
    );
  }
}
