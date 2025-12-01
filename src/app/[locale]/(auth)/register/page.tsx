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
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('registerTitle')}</CardTitle>
          <CardDescription>
            {t('registerDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form action={formAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? t('processing') : t('signUp')}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
           <div className="text-sm text-muted-foreground w-full text-center">
             {t('alreadyHaveAccount')} <Link href={`/${locale}/login`} className="text-primary hover:underline">{t('signIn')}</Link>
           </div>
        </CardFooter>
      </Card>
    </div>
  )
}
