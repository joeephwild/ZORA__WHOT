'use server';
import { NextRequest, NextResponse } from 'next/server';
import * as gameService from '@/services/gameService';
import { makeAiMove } from '@/ai/flows/gameAiFlow';

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
                const { gameId, playerId, card } = payload;
                let gameState = gameService.playCard(gameId, playerId, card);

                // If it's the AI's turn, let the AI play
                if (gameState.currentPlayerId === 'ai') {
                    const aiResponse = await makeAiMove({
                        aiHand: gameState.aiHand,
                        discardPileTopCard: gameState.discardPile[gameState.discardPile.length - 1],
                        // We pass the whole hand and let the AI decide which are valid
                        validMoves: gameState.aiHand 
                    });
                    
                    if (aiResponse.cardToPlay) {
                        gameState = gameService.playCard(gameId, 'ai', aiResponse.cardToPlay);
                    } else {
                         gameState = gameService.drawCard(gameId, 'ai');
                    }
                }
                return NextResponse.json(gameState);
            }
            case 'drawCard': {
                const { gameId, playerId } = payload;
                const gameState = gameService.drawCard(gameId, playerId);
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
