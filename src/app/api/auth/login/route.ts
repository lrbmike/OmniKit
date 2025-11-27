import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Mock validation
    if (email === 'admin@example.com' && password === 'password') {
      // Return a mock token
      return NextResponse.json({ 
        token: 'mock-jwt-token-from-api',
        user: { id: 1, name: 'Admin', email } 
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
