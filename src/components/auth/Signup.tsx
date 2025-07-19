'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnect } from 'thirdweb/react';
import { inAppWallet, preAuthenticate } from 'thirdweb/wallets/in-app';
import { client } from '@/lib/thirdweb-client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const wallet = inAppWallet();

export default function Signup() {
    const router = useRouter();
    const { connect, isConnecting } = useConnect();
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [error, setError] = useState<string | null>(null);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            await preAuthenticate({
                client,
                strategy: 'email',
                email,
            });
            setStep('code');
        } catch (err: any) {
            console.error('Email pre-authentication failed:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        connect(async () => {
            try {
                await wallet.connect({
                    client,
                    strategy: 'email',
                    email,
                    verificationCode,
                });
                router.push('/dashboard');
                return wallet;
            } catch (err: any) {
                 console.error('Connection failed:', err);
                 setError(err.message || 'Invalid verification code. Please try again.');
                 // Reset to email step on failure to allow re-trying
                 setStep('email');
                 setVerificationCode('');
                 throw err; // re-throw to notify useConnect of the error
            }
        });
    };

    return (
        <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
                <h1 className="text-4xl font-headline font-bold text-primary">Create Account</h1>
                <CardDescription>Enter your email to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                {step === 'email' && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isConnecting}
                            />
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" disabled={isConnecting}>
                            {isConnecting ? <Loader2 className="animate-spin" /> : 'Send Code'}
                        </Button>
                    </form>
                )}

                {step === 'code' && (
                    <form onSubmit={handleCodeSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="verification-code">Verification Code</Label>
                            <Input
                                id="verification-code"
                                type="text"
                                placeholder="123456"
                                required
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                disabled={isConnecting}
                            />
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" disabled={isConnecting}>
                            {isConnecting ? <Loader2 className="animate-spin" /> : 'Verify & Sign Up'}
                        </Button>
                    </form>
                )}
                 {error && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="text-sm text-center mt-4">
                    Already have an account?{' '}
                    <Link href="/" className="underline text-primary">
                        Sign In
                    </Link>
                </div>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-xs text-muted-foreground text-center">
                    By signing up, you create an in-app wallet and agree to our Terms.
                </p>
            </CardFooter>
        </Card>
    );
}
