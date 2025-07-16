import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { homeId } = await request.json();
    
    if (!homeId || typeof homeId !== 'number') {
      return NextResponse.json({ error: 'Valid homeId is required' }, { status: 400 });
    }

    // Update the user's default home in the backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3000'}/api/users/${session.user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultHomeId: homeId })
    });

    if (!response.ok) {
      throw new Error('Failed to update default home');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating selected home:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
