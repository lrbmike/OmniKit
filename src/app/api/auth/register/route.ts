import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (email && password) {
      return NextResponse.json({ 
        token: 'mock-jwt-token-register',
        user: { id: 2, name: 'New User', email } 
      });
    }

    return NextResponse.json(
      { error: 'Invalid data' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
