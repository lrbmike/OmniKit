import {getTranslations, setRequestLocale} from 'next-intl/server';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Index');
 
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('description')}
        </p>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link href="/login">
            <Button>{t('signIn')}</Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary">{t('signUp')}</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
