'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppleIcon } from '@/components/icons/AppleIcon';
import { Mail } from 'lucide-react';

export default function Login() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd perform authentication here.
    // For this UI demo, we'll just navigate to the dashboard.
    router.push('/dashboard');
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <h1 className="text-4xl font-headline font-bold text-primary">FAAJI</h1>
        <CardDescription>The Ultimate Whot! Experience</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            Sign In / Sign Up
          </Button>
        </form>
        <div className="relative my-6">
          <Separator />
          <div className="absolute inset-0 flex items-center">
            <span className="bg-card px-2 text-sm text-muted-foreground mx-auto">OR</span>
          </div>
        </div>
        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
            <GoogleIcon className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
            <AppleIcon className="mr-2 h-5 w-5" />
            Continue with Apple
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you create an in-app wallet and agree to our Terms.
        </p>
      </CardFooter>
    </Card>
  );
}
