import { ReactNode } from 'react';
import { isSystemInitialized } from '@/lib/init';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getSession } from '@/lib/session';

export default async function AuthLayout({ children }: { children: ReactNode }) {
    const initialized = await isSystemInitialized();
    const locale = await getLocale();

    if (!initialized) {
        redirect(`/${locale}/init`);
    }

    const session = await getSession();
    if (session.isLoggedIn) {
        redirect(`/${locale}/admin/dashboard`);
    }

    return (
        <>
            {children}
        </>
    );
}
