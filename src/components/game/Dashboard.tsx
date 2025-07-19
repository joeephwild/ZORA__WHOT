'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Shield, Gem, BookOpen, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import GameInstructionsModal from './GameInstructionsModal';

export default function Dashboard() {
  const router = useRouter();
  const [showInstructions, setShowInstructions] = useState(false);

  const startPracticeGame = () => {
    // Navigate to the dedicated practice route
    router.push(`/practice`);
  };

  return (
    <>
    <GameInstructionsModal isOpen={showInstructions} onOpenChange={setShowInstructions} />
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full filter blur-3xl animate-pulse [animation-delay:400ms]"></div>
      
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <h1 className="text-2xl font-bold text-primary font-headline">FAAJI</h1>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => setShowInstructions(true)}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        How to Play
                    </Button>
                    <div className="flex items-center gap-2">
                        <Gem className="w-5 h-5 text-blue-500" />
                        <span className="font-bold">1,200 ZORA</span>
                    </div>
                    <Avatar>
                        <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-headline tracking-tight">Welcome Back!</h2>
            <p className="text-muted-foreground mt-2 text-lg">Ready to challenge the Whot! world?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:shadow-xl hover:-translate-y-1 transition-transform duration-300 bg-card/80 backdrop-blur-sm">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-secondary rounded-full mb-4">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="font-headline text-2xl">Practice Mode</CardTitle>
              <CardDescription>Hone your skills against our AI.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={startPracticeGame} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">Play vs. AI</Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent hover:shadow-2xl hover:-translate-y-1 transition-transform duration-300 bg-card/80 backdrop-blur-sm md:col-span-1">
            <CardHeader className="items-center text-center">
              <div className="p-4 bg-secondary rounded-full mb-4">
                 <Users className="w-10 h-10 text-accent" />
              </div>
              <CardTitle className="font-headline text-2xl">Multiplayer</CardTitle>
              <CardDescription>Play against others in free or staked matches.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Link href="/lobby" passHref>
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold">Enter Lobby</Button>
                </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </>
  );
}
