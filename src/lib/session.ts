import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
    userId: string;
    email: string;
    isLoggedIn: boolean;
}

const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
    cookieName: 'omnikit_session',
    cookieOptions: {
        // Default to false to support HTTP deployment (e.g. Docker on LAN)
        // Set ENABLE_SECURE_COOKIE=true in .env if using HTTPS in production
        secure: process.env.ENABLE_SECURE_COOKIE === 'true',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days (will be overridden by DB config)
    },
};

export async function getSession(): Promise<IronSession<SessionData>> {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCurrentUser() {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
        return null;
    }

    return {
        userId: session.userId,
        email: session.email,
    };
}
