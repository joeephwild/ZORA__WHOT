'use client';

import { useState, useEffect } from 'react';
import type { GameState, Card, Shape } from '@/lib/whot';
import { WhotCard } from "./WhotCard";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Swords, Bot, Loader2, Crown } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';


export default function GameBoard({ gameMode }: { gameMode: string }) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const topOfDiscardPile = gameState ? gameState.discardPile[gameState.discardPile.length - 1] : null;

    useEffect(() => {
        const startNewGame = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/game', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'newGame',
                        payload: { playerId: 'player1', gameMode }
                    })
                });
                if (!res.ok) throw new Error('Failed to start game');
                const newGame: GameState = await res.json();
                setGameState(newGame);
            } catch (err: any) {
                setError(err.message);
                toast({
                    title: "Error",
                    description: "Could not start a new game. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        startNewGame();
    }, [gameMode, toast]);

    const handleCardPlay = async (card: Card) => {
        if (!gameState || gameState.currentPlayerId !== 'player1' || gameState.winner) return;

        try {
            const res = await fetch('/api/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'playCard',
                    payload: { gameId: gameState.gameId, playerId: 'player1', card }
                })
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to play card');
            }
            const updatedState: GameState = await res.json();
            setGameState(updatedState);
        } catch (err: any) {
             toast({ title: "Invalid Move", description: err.message, variant: "destructive" });
        }
    };
    
    const handleDrawCard = async () => {
        if (!gameState || gameState.currentPlayerId !== 'player1' || gameState.winner) return;
        
        try {
             const res = await fetch('/api/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'drawCard',
                    payload: { gameId: gameState.gameId, playerId: 'player1' }
                })
            });
            if (!res.ok) throw new Error('Failed to draw card');
            const updatedState: GameState = await res.json();
            setGameState(updatedState);
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    if (loading) {
        return (
            <div className="bg-background min-h-screen w-full flex flex-col items-center justify-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Setting up your game...</p>
            </div>
        )
    }

    if (error || !gameState) {
        return (
            <div className="bg-background min-h-screen w-full flex flex-col items-center justify-center p-4">
                <p className="text-destructive-foreground bg-destructive p-4 rounded-md">{error || 'Could not load game state.'}</p>
                 <Button onClick={() => router.push('/dashboard')} className="mt-4">Back to Dashboard</Button>
            </div>
        )
    }

  return (
    <>
    <AlertDialog open={!!gameState.winner}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-3xl font-headline">
                {gameState.winner === 'player1' ? 'Congratulations!' : 'Game Over'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg">
                <div className="flex justify-center items-center my-4">
                    <Crown className={`w-16 h-16 ${gameState.winner === 'player1' ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                </div>
                {gameState.winner === 'player1' ? 'You have won the game!' : 'The AI opponent has won. Better luck next time!'}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/dashboard')} className="w-full">
                Return to Dashboard
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>


    <div className="bg-background min-h-screen w-full flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5"></div>
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-accent/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-3xl"></div>

        <div className="relative w-full max-w-7xl h-[95vh] flex flex-col justify-between">
            {/* Opponent Area */}
            <div className="w-full flex flex-col items-center">
                <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md mb-3">
                    <Avatar>
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">AI Player ({gameState.aiHand.length} cards)</h3>
                        <p className="text-xs text-muted-foreground">
                            {gameState.currentPlayerId === 'ai' ? 'Thinking...' : 'Waiting...'}
                        </p>
                    </div>
                     {gameState.currentPlayerId === 'ai' 
                        ? <Badge variant="default" className="bg-accent text-accent-foreground">AI'S TURN</Badge>
                        : <Badge variant="destructive">OPPONENT</Badge>
                     }
                </div>
                <div className="flex justify-center items-end h-28">
                    {gameState.aiHand.map((card, index) => (
                        <div key={card.id} className="w-16 -mx-3">
                            <WhotCard card={card} isFaceDown />
                        </div>
                    ))}
                </div>
            </div>

            {/* Center Piles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-24 sm:w-28 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                        <WhotCard card={{id: 99, shape: 'whot', number: 20}} isFaceDown />
                    </div>
                     <Button variant="outline" size="sm" onClick={handleDrawCard} disabled={gameState.currentPlayerId !== 'player1'}>Draw Card</Button>
                     <p className="text-xs font-semibold text-muted-foreground">{gameState.drawPile.length} left</p>
                </div>
                <Swords className="w-8 h-8 text-muted-foreground/50" />
                <div className="flex flex-col items-center gap-2">
                    <div className="w-24 sm:w-28 transform-gpu transition-transform duration-500">
                        {topOfDiscardPile && <WhotCard card={topOfDiscardPile} />}
                    </div>
                     <p className="text-xs font-semibold text-muted-foreground">Play Pile</p>
                </div>
            </div>
            
            {/* Player Area */}
            <div className="w-full flex flex-col items-center">
                <div className="flex justify-center items-start h-40">
                    {gameState.playerHand.map((card) => (
                        <div key={card.id} onClick={() => handleCardPlay(card)} className="w-20 sm:w-24 -mx-4 sm:-mx-6 transform transition-transform duration-300 hover:-translate-y-4 hover:z-10 cursor-pointer">
                            <WhotCard card={card} />
                        </div>
                    ))}
                </div>
                 <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md mt-3">
                    <Avatar>
                        <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">You ({gameState.playerHand.length} cards)</h3>
                        <p className="text-xs text-muted-foreground">
                             {gameState.currentPlayerId === 'player1' ? 'Your turn' : 'Waiting...'}
                        </p>
                    </div>
                     {gameState.currentPlayerId === 'player1'
                        ? <Badge variant="default" className="bg-accent text-accent-foreground">YOUR TURN</Badge>
                        : <Badge variant="secondary">WAITING</Badge>
                     }
                </div>
            </div>
        </div>
    </div>
    </>
  );
}
