import {getTranslations} from 'next-intl/server';
import Link from 'next/link';
 
export default async function NotFound() {
  const t = await getTranslations('NotFoundPage');
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
      <p className="mb-4">{t('description')}</p>
      <Link href="/" className="text-blue-500 hover:underline">
        {t('backToHome')}
      </Link>
    </div>
  );
}
