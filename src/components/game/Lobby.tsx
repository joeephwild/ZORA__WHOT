'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PlusCircle, Users, ArrowLeft, Gem, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GameRoom } from '@/services/lobbyService';
import { Badge } from '../ui/badge';

export default function Lobby() {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/lobby?action=getRooms');
      if (!res.ok) throw new Error('Failed to fetch rooms');
      const data = await res.json();
      setRooms(data.rooms);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not fetch game rooms.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRooms();
    // In a real app, you'd use WebSockets or polling to get live updates
    // const interval = setInterval(fetchRooms, 5000); 
    // return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleCreateRoom = async (gameMode: 'staked' | 'free') => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createRoom',
          payload: { hostId: 'player1', gameMode }, // hostId would be dynamic
        }),
      });
      if (!res.ok) throw new Error('Failed to create room');
      const newRoom = await res.json();
      // Navigate to a "waiting" screen for the created room
      // For now, we'll just refresh the lobby to show the new room
      toast({ title: 'Success', description: `New ${gameMode} room created!`});
      fetchRooms();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not create game room.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    // Logic to join the room and start the game
    console.log(`Joining room ${roomId}`);
    toast({ title: 'Coming Soon!', description: 'Joining multiplayer games is not yet implemented.' });
    // In a real implementation:
    // router.push(`/play/${roomId}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full filter blur-3xl animate-pulse [animation-delay:400ms]"></div>
      
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
        <header className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-primary font-headline">Game Lobby</h1>
            <div />
        </header>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Open Matches</span>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleCreateRoom('free')} disabled={isCreating} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Free Match
                    </Button>
                    <Button onClick={() => handleCreateRoom('staked')} disabled={isCreating} size="sm" variant="secondary">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Staked Match
                    </Button>
                </div>
            </CardTitle>
            <CardDescription>Join an existing game or create your own.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : rooms.length > 0 ? (
                rooms.map((room) => (
                  <div key={room.roomId} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-4">
                      {room.gameMode === 'staked' ? 
                        <Gem className="w-6 h-6 text-accent" /> :
                        <Shield className="w-6 h-6 text-primary" />
                      }
                      <div>
                        <p className="font-semibold">
                          {room.hostId}'s Game Room
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Waiting for player...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {room.gameMode === 'staked' && (
                             <Badge variant="outline" className="border-accent text-accent font-bold">100 ZORA</Badge>
                        )}
                        <Button onClick={() => handleJoinRoom(room.roomId)}>Join Game</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Open Games</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Be the first to create one!
                    </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
