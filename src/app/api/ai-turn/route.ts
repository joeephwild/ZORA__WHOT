'use server';
import { NextRequest, NextResponse } from 'next/server';
import * as gameService from '@/services/gameService';
import { makeAiMove } from '@/ai/flows/gameAiFlow';
import type { Card, GameState } from '@/lib/whot';

async function handleAiTurn(gameId: string): Promise<GameState> {
    let gameState = gameService.getGameState(gameId);
    if (!gameState) {
        throw new Error("Game not found");
    }

    if (gameState.currentPlayerId !== 'ai' || gameState.winner) {
        return gameState;
    }

    // AI needs to decide which card to play
    const aiResponse = await makeAiMove({
        aiHand: gameState.aiHand,
        discardPileTopCard: gameState.discardPile[gameState.discardPile.length - 1],
        validMoves: gameState.aiHand.filter(card => 
            gameService.isValidMove(card, gameState!.discardPile[gameState!.discardPile.length - 1], gameState!.requestedShape)
        ),
        requestedShape: gameState.requestedShape || null,
    });
    
    let updatedGameState;
    if (aiResponse.cardToPlay) {
        // console.log('AI plays:', aiResponse.cardToPlay, 'Reasoning:', aiResponse.reasoning);
        updatedGameState = gameService.playCard(gameId, 'ai', aiResponse.cardToPlay, aiResponse.requestedShape);
    } else {
        // console.log('AI draws card. Reasoning:', aiResponse.reasoning);
        updatedGameState = gameService.drawCard(gameId, 'ai');
    }

    // If the AI played a card that gives it another turn (e.g., Hold On, Suspension, Whot!), handle it.
    if (updatedGameState && updatedGameState.currentPlayerId === 'ai' && !updatedGameState.winner) {
        // Recursive call to handle consecutive AI turns.
        // Add a small delay to make the AI's consecutive plays visible to the user.
        await new Promise(resolve => setTimeout(resolve, 1000));
        return await handleAiTurn(gameId); 
    }
    
    return updatedGameState;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { gameId } = body;

        if (!gameId) {
            return NextResponse.json({ message: 'gameId is required' }, { status: 400 });
        }
        
        const finalState = await handleAiTurn(gameId);
        return NextResponse.json(finalState);

    } catch (error: any) {
        console.error('AI Turn API Error:', error);
        return NextResponse.json({ message: 'An error occurred during AI turn', error: error.message }, { status: 500 });
    }
}
