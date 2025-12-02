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
import { login } from "@/actions/auth"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useLocale } from "next-intl"

export default function LoginPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result.success) {
      toast.success('Login successful!');
      // Don't set isLoading to false here, keep showing spinner while redirecting
      router.push(`/${locale}/admin/dashboard`);
    } else {
      setIsLoading(false);
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
          <CardDescription>
            {t('loginDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? t('loggingIn') : t('signIn')}
            </Button>
          </form>
        </CardContent>
        {/* <CardFooter className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground w-full text-center">
            {t('dontHaveAccount')} <Link href={`/${locale}/register`} className="text-primary hover:underline">{t('signUp')}</Link>
          </div>
        </CardFooter> */}
      </Card>
    </div>
  )
}
