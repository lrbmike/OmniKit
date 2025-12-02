'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register } from "@/actions/auth"
import { Link, useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { useLocale } from "next-intl"

const initialState = {
  success: false,
  error: '' as string | undefined
}

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const locale = useLocale();

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await register(formData);
  }, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(t('registerSuccess') || 'Registration successful');
      router.push(`/${locale}/login`);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, t, locale]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
          <CardDescription>
            {t('registerClosed')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-6">
            <p className="text-center text-muted-foreground">
               {t('registerClosedDesc')}
            </p>
            <Button asChild variant="outline">
                <Link href={`/${locale}/login`}>{t('signIn')}</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  )
}
