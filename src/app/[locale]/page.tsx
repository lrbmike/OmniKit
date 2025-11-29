import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  
  // 检查用户是否已登录
  const user = await getCurrentUser();
  
  if (user) {
    // 已登录，重定向到 dashboard
    redirect(`/${locale}/admin/dashboard`);
  } else {
    // 未登录，重定向到登录页
    redirect(`/${locale}/login`);
  }
}
