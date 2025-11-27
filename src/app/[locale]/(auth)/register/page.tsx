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
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function RegisterPage() {
  const t = await getTranslations("Auth");

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
          <form action={register} className="grid gap-4">
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
            <Button className="w-full" type="submit">{t('signUp')}</Button>
          </form>
        </CardContent>
        <CardFooter>
           <div className="text-sm text-muted-foreground w-full text-center">
             {t('alreadyHaveAccount')} <Link href="/login" className="text-primary hover:underline">{t('signIn')}</Link>
           </div>
        </CardFooter>
      </Card>
    </div>
  )
}
