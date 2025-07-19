
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { GameState, Card, Shape } from '@/lib/whot';
import { WhotCard } from "./WhotCard";
import { Avatar, AvatarFallback } from "../ui/avatar";
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
import { AnimatePresence, motion } from 'framer-motion';
import GameSounds from './GameSounds';

type AudioEvent = 'play' | 'draw' | 'shuffle' | 'win' | 'lose' | 'invalid' | null;

const TurnIndicator = ({ message }: { message: string }) => (
    <motion.div
        key={message}
        initial={{ opacity: 0, y: 50, scale: 0.5 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.5, transition: { duration: 0.3 } }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
    >
        <div className="bg-black/70 backdrop-blur-sm text-white font-bold text-3xl sm:text-5xl px-10 py-5 rounded-xl shadow-lg border-2 border-white/20">
            {message}
        </div>
    </motion.div>
);


export default function GameBoard({ gameId }: { gameId: string }) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isChoosingShape, setIsChoosingShape] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [cardToPlay, setCardToPlay] = useState<Card | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [turnMessage, setTurnMessage] = useState<string | null>(null);
    const [lastPlayerId, setLastPlayerId] = useState<string | null>(null);
    const [invalidMoveCardId, setInvalidMoveCardId] = useState<string | null>(null);
    const [playedCard, setPlayedCard] = useState<Card | null>(null);
    const [aiPlayedCard, setAiPlayedCard] = useState<Card | null>(null);
    const [audioEvent, setAudioEvent] = useState<AudioEvent>(null);

    const { toast } = useToast();
    const router = useRouter();
    
    // In practice mode, player is always 'player1'
    const myPlayerId = gameState?.gameMode === 'practice' ? 'player1' : 'player1'; // Placeholder for real auth
    const playerTurn = gameState?.currentPlayerId === myPlayerId;
    const topOfDiscardPile = gameState ? gameState.discardPile[gameState.discardPile.length - 1] : null;

    // Effect for starting or fetching a game
    useEffect(() => {
        const initializeGame = async () => {
            setLoading(true);
            setError(null);
            
            try {
                let gameData: GameState;
                if (gameId === 'practice') {
                    setAudioEvent('shuffle');
                    const res = await fetch('/api/game', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'newGame',
                            payload: { gameMode: 'practice' }
                        })
                    });
                    if (!res.ok) throw new Error('Failed to start practice game');
                    gameData = await res.json();
                } else {
                     const res = await fetch(`/api/game?gameId=${gameId}`);
                     if (!res.ok) {
                        if (res.status === 404) {
                            throw new Error('Game not found. It may have expired or never existed.');
                        }
                        throw new Error('Could not load game.');
                     }
                     gameData = await res.json();
                }
                setGameState(gameData);
                setLastPlayerId(gameData.currentPlayerId);
            } catch (err: any) {
                setError(err.message);
                toast({
                    title: "Error",
                    description: err.message || "Could not start or load the game. Please try again.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        initializeGame();
    }, [gameId, toast]);

    // Effect for showing turn change message
    useEffect(() => {
        if (gameState && gameState.currentPlayerId !== lastPlayerId && !gameState.winner) {
            const message = gameState.currentPlayerId === myPlayerId ? "Your Turn!" : "Opponent's Turn";
            setTurnMessage(message);
            const timer = setTimeout(() => setTurnMessage(null), 1500);
            setLastPlayerId(gameState.currentPlayerId);
            return () => clearTimeout(timer);
        }
         if (gameState?.winner) {
            setAudioEvent(gameState.winner === myPlayerId ? 'win' : 'lose');
        }
    }, [gameState, lastPlayerId, myPlayerId]);

    // Effect to trigger AI turn (only in practice mode)
    const handleAiTurn = useCallback(async (gameId: string) => {
        setIsSubmitting(true);
        const originalState = gameState;

        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pause for realism
            const res = await fetch('/api/ai-turn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId })
            });

            if (!res.ok) {
                 const errorData = await res.json();
                 throw new Error(errorData.error || "AI failed to make a move.");
            }
            
            const updatedState: GameState = await res.json();

            const aiCard = originalState?.aiHand.find(c => !updatedState.aiHand.some(uc => uc.id === c.id));
            
            if (aiCard) {
                setAiPlayedCard(aiCard);
                setAudioEvent('play');
                await new Promise(resolve => setTimeout(resolve, 500)); // Animation duration
            } else {
                setAudioEvent('draw');
                 await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            setGameState(updatedState);
            
        } catch (err: any) {
            toast({ title: "AI Error", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
            setAiPlayedCard(null);
        }

    }, [gameState, toast]);

    useEffect(() => {
        if (gameState?.gameMode === 'practice' && gameState?.currentPlayerId === 'ai' && !isSubmitting && !gameState.winner) {
            handleAiTurn(gameState.gameId);
        }
    }, [gameState, isSubmitting, handleAiTurn]);


    const submitPlayerMove = async (action: 'playCard' | 'drawCard', payload: any) => {
        if (!gameState || gameState.winner || isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            if (action === 'playCard') {
                setAudioEvent('play');
                setPlayedCard(payload.card);
            } else {
                setAudioEvent('draw');
            }

            await new Promise(resolve => setTimeout(resolve, 300)); // Animation time

            const res = await fetch('/api/game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'An unexpected error occurred.');
            }

            const updatedState: GameState = await res.json();
            setGameState(updatedState);

        } catch (err: any) {
            toast({ title: "Invalid Move", description: err.message, variant: "destructive" });
            setAudioEvent('invalid');
            if (action === 'playCard') {
                setInvalidMoveCardId(payload.card.id);
                setTimeout(() => setInvalidMoveCardId(null), 500);
            }
        } finally {
            setIsSubmitting(false);
            setPlayedCard(null);
        }
    };

    const handleCardPlay = async (card: Card) => {
        if (!playerTurn || isSubmitting) return;

        if (card.shape === 'whot') {
            setCardToPlay(card);
            setIsChoosingShape(true);
        } else {
            await submitPlayerMove('playCard', { gameId: gameState!.gameId, playerId: myPlayerId, card });
        }
    };

    const handleShapeSelection = async (shape: Shape) => {
        if (!cardToPlay || isSubmitting) return;
        setIsChoosingShape(false);
        await submitPlayerMove('playCard', { 
            gameId: gameState!.gameId, 
            playerId: myPlayerId, 
            card: cardToPlay,
            requestedShape: shape 
        });
        setCardToPlay(null);
    }
    
    const handleDrawCard = async () => {
        if (!playerTurn || isSubmitting) return;
        await submitPlayerMove('drawCard', { gameId: gameState!.gameId, playerId: myPlayerId });
    };
    
    // Memos for displaying hands
    const myHand = useMemo(() => {
        if (!gameState) return [];
        if (gameState.gameMode === 'practice') return gameState.playerHand;
        return gameState?.players.find(p => p.id === myPlayerId)?.hand || [];
    }, [gameState, myPlayerId]);

    const opponent = useMemo(() => {
        if(!gameState) return null;
        if (gameState.gameMode === 'practice') {
             let hand = gameState.aiHand;
             if(aiPlayedCard) {
                hand = hand.filter(c => c.id !== aiPlayedCard.id);
            }
            return {
                id: 'ai',
                name: 'AI Player',
                hand,
                isAi: true
            }
        }

        const opponentPlayer = gameState.players.find(p => p.id !== myPlayerId);
        if (!opponentPlayer) return null;
        
        return {
            ...opponentPlayer,
            name: "Opponent", // Replace with real name later
            isAi: false
        }

    }, [gameState, myPlayerId, aiPlayedCard])


    if (loading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Setting up your game...</p>
                <GameSounds event="shuffle" onEnd={() => setAudioEvent(null)} />
            </div>
        )
    }

    if (error || !gameState || !opponent) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gray-900/50">
                <p className="text-white bg-red-500/80 p-4 rounded-md mb-4">{error || 'Could not load game state.'}</p>
                 <Button onClick={() => router.push('/dashboard')} className="mt-4 bg-green-500 hover:bg-green-600 text-white">Back to Dashboard</Button>
            </div>
        )
    }

  return (
    <>
    <GameSounds event={audioEvent} onEnd={() => setAudioEvent(null)} />
    <GameInstructionsModal isOpen={showInstructions} onOpenChange={setShowInstructions} />
    <AlertDialog open={!!gameState.winner}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-3xl font-headline">
                {gameState.winner === myPlayerId ? 'Congratulations!' : 'Game Over'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg">
                <div className="flex justify-center items-center my-4">
                    <Crown className={`w-16 h-16 ${gameState.winner === myPlayerId ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                </div>
                {gameState.winner === myPlayerId ? 'You have won the game!' : 'Your opponent has won. Better luck next time!'}
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
             <AnimatePresence>
                {turnMessage && <TurnIndicator message={turnMessage} />}
            </AnimatePresence>
            {/* Opponent Area */}
            <div className="w-full flex flex-col items-center">
                <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md mb-3">
                    <Avatar>
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">{opponent.name} ({opponent.hand.length} cards)</h3>
                        <p className="text-xs text-muted-foreground">
                            {gameState.currentPlayerId === opponent.id ? 'Thinking...' : 'Waiting...'}
                        </p>
                    </div>
                </div>
                <div className="flex justify-center items-end h-48">
                    <AnimatePresence>
                    {opponent.hand.map((card, index) => (
                        <motion.div 
                            key={card.id} 
                            layoutId={`card-${card.id}`}
                            className="w-24 sm:w-32 -mx-6 sm:-mx-8"
                        >
                             <WhotCard card={card} isFaceDown />
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Center Piles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-28 sm:w-36 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                         <button onClick={handleDrawCard} disabled={!playerTurn || isSubmitting} className="w-full disabled:cursor-not-allowed">
                            <WhotCard card={{id: 'draw-pile-card', shape: 'whot', number: 20}} isFaceDown />
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
                    <div className="w-28 sm:w-36 transform-gpu transition-transform duration-500 relative">
                        {topOfDiscardPile && <WhotCard card={topOfDiscardPile} />}
                        <AnimatePresence>
                        {playedCard && (
                             <motion.div
                                layoutId={`card-${playedCard.id}`}
                                className="absolute inset-0"
                                initial={{ opacity: 0, scale: 1.5, rotate: 15 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                                <WhotCard card={playedCard} />
                            </motion.div>
                        )}
                        {aiPlayedCard && (
                             <motion.div
                                layoutId={`card-${aiPlayedCard.id}`}
                                className="absolute inset-0"
                                initial={{ opacity: 0, scale: 1.5, rotate: -15 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            >
                                <WhotCard card={aiPlayedCard} />
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                     <p className="text-xs font-semibold text-muted-foreground">Play Pile</p>
                </div>
            </div>
            
            {/* Player Area */}
            <div className="w-full flex flex-col items-center">
                <div className="flex justify-center items-start h-48">
                    <AnimatePresence>
                    {myHand.map((card) => (
                        <motion.button
                            layoutId={`card-${card.id}`}
                            key={card.id} 
                            onClick={() => handleCardPlay(card)} 
                            disabled={!playerTurn || isSubmitting || !!playedCard} 
                            className="w-24 sm:w-32 -mx-6 sm:-mx-8 disabled:cursor-not-allowed disabled:opacity-70"
                            whileHover={{ y: -16, zIndex: 20, scale: 1.05 }}
                            animate={invalidMoveCardId === card.id ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                            transition={{ duration: 0.5, type: 'spring' }}
                        >
                            <WhotCard card={card} />
                        </motion.button>
                    ))}
                    </AnimatePresence>
                </div>
                 <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm p-2 rounded-lg shadow-md mt-3">
                    <Avatar>
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold">You ({myHand.length} cards)</h3>
                        <p className="text-xs text-muted-foreground">
                             {playerTurn ? 'Your turn' : 'Waiting...'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  );
}
