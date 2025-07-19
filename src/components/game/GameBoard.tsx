'use client';

import { useState, useEffect } from 'react';
import type { GameState, Card, Shape } from '@/lib/whot';
import { WhotCard } from "./WhotCard";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Swords, Bot, Loader2, Crown, Info, Home } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation';
import { ShapeIcon } from '../icons/WhotShapes';
import GameInstructionsModal from './GameInstructionsModal';


export default function GameBoard({ gameMode }: { gameMode: string }) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isChoosingShape, setIsChoosingShape] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [cardToPlay, setCardToPlay] = useState<Card | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const topOfDiscardPile = gameState ? gameState.discardPile[gameState.discardPile.length - 1] : null;
    const playerTurn = gameState?.currentPlayerId === 'player1';

    useEffect(() => {
        const startNewGame = async () => {
            setLoading(true);
            setError(null);
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

    const submitMove = async (action: 'playCard' | 'drawCard', payload: any) => {
        if (!gameState || gameState.winner || isSubmitting) return;
        setIsSubmitting(true);
        
        try {
            const res = await fetch('/api/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'An unexpected error occurred.');
            }

            const updatedState: GameState = await res.json();
            setGameState(updatedState);

        } catch (err: any) {
            toast({ title: "Invalid Move", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCardPlay = async (card: Card) => {
        if (!playerTurn || isSubmitting) return;

        if (card.shape === 'whot') {
            setCardToPlay(card);
            setIsChoosingShape(true);
        } else {
            await submitMove('playCard', { gameId: gameState!.gameId, playerId: 'player1', card });
        }
    };

    const handleShapeSelection = async (shape: Shape) => {
        if (!cardToPlay || isSubmitting) return;
        setIsChoosingShape(false);
        await submitMove('playCard', { 
            gameId: gameState!.gameId, 
            playerId: 'player1', 
            card: cardToPlay,
            requestedShape: shape 
        });
        setCardToPlay(null);
    }
    
    const handleDrawCard = async () => {
        if (!playerTurn || isSubmitting) return;
        await submitMove('drawCard', { gameId: gameState!.gameId, playerId: 'player1' });
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Setting up your game...</p>
            </div>
        )
    }

    if (error || !gameState) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
                <p className="text-destructive-foreground bg-destructive p-4 rounded-md">{error || 'Could not load game state.'}</p>
                 <Button onClick={() => router.push('/dashboard')} className="mt-4">Back to Dashboard</Button>
            </div>
        )
    }

  return (
    <>
    <GameInstructionsModal isOpen={showInstructions} onOpenChange={setShowInstructions} />
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
    
    <Dialog open={isChoosingShape} onOpenChange={setIsChoosingShape}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Request a Shape</DialogTitle>
                <DialogDescription>
                    You played a WHOT! card. Choose the shape for the next player.
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-5 gap-4 py-4">
                {(['circle', 'triangle', 'cross', 'square', 'star'] as const).map(shape => (
                    <button key={shape} onClick={() => handleShapeSelection(shape)} className="p-2 rounded-lg border-2 border-transparent hover:border-accent focus:border-accent focus:outline-none transition-colors">
                        <ShapeIcon shape={shape} className="w-12 h-12 mx-auto" />
                        <span className="sr-only">{shape}</span>
                    </button>
                ))}
            </div>
        </DialogContent>
    </Dialog>


    <div className="min-h-screen w-full flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        {/* Top bar with actions */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push('/dashboard')}>
                <Home className="w-4 h-4" />
                <span className="sr-only">Dashboard</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowInstructions(true)}>
                <Info className="w-4 h-4" />
                <span className="sr-only">Game Rules</span>
            </Button>
        </div>


        {/* Background elements */}
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full filter blur-3xl animate-pulse [animation-delay:400ms]"></div>

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
                        ? <Badge variant="default" className="bg-destructive animate-pulse">AI'S TURN</Badge>
                        : <Badge variant="outline">OPPONENT</Badge>
                     }
                </div>
                <div className="flex justify-center items-end h-28">
                    {gameState.aiHand.map((_, index) => (
                        <div key={index} className="w-16 -mx-3">
                            <WhotCard card={{ id: 999 + index, shape: 'whot', number: 20 }} isFaceDown />
                        </div>
                    ))}
                </div>
            </div>

            {/* Center Piles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-24 sm:w-28 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                         <button onClick={handleDrawCard} disabled={!playerTurn || isSubmitting} className="w-full disabled:cursor-not-allowed">
                            <WhotCard card={{id: 99, shape: 'whot', number: 20}} isFaceDown />
                         </button>
                    </div>
                     <Button variant="outline" size="sm" onClick={handleDrawCard} disabled={!playerTurn || isSubmitting}>Draw Card</Button>
                     <p className="text-xs font-semibold text-muted-foreground">{gameState.drawPile.length} left</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                     {gameState.requestedShape && (
                        <div className="flex flex-col items-center p-2 rounded-lg bg-card/80 backdrop-blur-sm shadow-md mb-2">
                            <p className="text-xs font-bold text-muted-foreground">REQUESTED</p>
                            <ShapeIcon shape={gameState.requestedShape} className="w-8 h-8"/>
                        </div>
                     )}
                    <Swords className="w-8 h-8 text-muted-foreground/50" />
                </div>
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
                        <button key={card.id} onClick={() => handleCardPlay(card)} disabled={!playerTurn || isSubmitting} className="w-20 sm:w-24 -mx-4 sm:-mx-6 transform transition-transform duration-300 hover:-translate-y-4 hover:z-10 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:-translate-y-0">
                            <WhotCard card={card} />
                        </button>
                    ))}
                </div>
                 <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md mt-3">
                    <Avatar>
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">You ({gameState.playerHand.length} cards)</h3>
                        <p className="text-xs text-muted-foreground">
                             {playerTurn ? 'Your turn' : 'Waiting...'}
                        </p>
                    </div>
                     {playerTurn
                        ? <Badge variant="default" className="bg-accent animate-pulse">YOUR TURN</Badge>
                        : <Badge variant="secondary">WAITING</Badge>
                     }
                </div>
            </div>
        </div>
    </div>
    </>
  );
}
