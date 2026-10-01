import { NextRequest, NextResponse } from 'next/server';
import { triggerIncidentFusion, fetchIncidents } from '@/lib/data/service';

export async function POST(req: NextRequest) {
  try {
    const result = await triggerIncidentFusion();
    return NextResponse.json({
      success: true,
      message: `Incident fusion completed successfully.`,
      newIncidentCount: result.newIncidentCount,
      incidents: result.incidents,
    });
  } catch (error) {
    console.error('Error in incident fusion API route:', error);
    // Graceful fallback
    const incidents = await fetchIncidents();
    return NextResponse.json(
      {
        success: false,
        message: 'Fusion fallback used.',
        incidents,
      },
      { status: 200 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const incidents = await fetchIncidents();
    return NextResponse.json({
      success: true,
      incidents,
    });
  } catch (error) {
    console.error('Error fetching incidents in API route:', error);
    return NextResponse.json(
      { success: false, incidents: [] },
      { status: 200 }
    );
  }
}
