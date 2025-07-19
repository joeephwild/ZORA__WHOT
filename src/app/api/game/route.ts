'use server';
import { NextRequest, NextResponse } from 'next/server';
import * as gameService from '@/services/gameService';
import { makeAiMove } from '@/ai/flows/gameAiFlow';
import type { Card } from '@/lib/whot';

async function handleAiTurn(gameId: string) {
    let gameState = gameService.getGameState(gameId);
    if (!gameState || gameState.currentPlayerId !== 'ai' || gameState.winner) {
        return gameState;
    }

    // AI needs to decide which card to play
    const aiResponse = await makeAiMove({
        aiHand: gameState.aiHand,
        discardPileTopCard: gameState.discardPile[gameState.discardPile.length - 1],
        validMoves: gameState.aiHand.filter(card => 
            gameService.isValidMove(card, gameState!.discardPile[gameState!.discardPile.length - 1], gameState!.requestedShape)
        ),
        requestedShape: gameState.requestedShape,
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
        const { action, payload } = body;

        switch (action) {
            case 'newGame': {
                const newGame = gameService.createGame(payload.playerId, payload.gameMode);
                return NextResponse.json(newGame);
            }
            case 'playCard': {
                const { gameId, playerId, card, requestedShape } = payload;
                let gameState = gameService.playCard(gameId, playerId, card, requestedShape);

                // If it's the AI's turn after the player's move, let the AI play
                if (gameState.currentPlayerId === 'ai' && !gameState.winner) {
                    // Add a small delay to make the game feel more natural
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const finalState = await handleAiTurn(gameId);
                    return NextResponse.json(finalState);
                }
                
                return NextResponse.json(gameState);
            }
            case 'drawCard': {
                const { gameId, playerId } = payload;
                let gameState = gameService.drawCard(gameId, playerId);

                 // If it's the AI's turn after the player draws, let the AI play
                if (gameState.currentPlayerId === 'ai' && !gameState.winner) {
                     // Add a small delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    const finalState = await handleAiTurn(gameId);
                    return NextResponse.json(finalState);
                }

                return NextResponse.json(gameState);
            }
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ message: 'An error occurred', error: error.message }, { status: 500 });
    }
}
