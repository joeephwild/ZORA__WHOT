'use server';
import { NextRequest, NextResponse } from 'next/server';
import * as gameService from '@/services/gameService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        switch (action) {
            case 'newGame': {
                const playerIds = payload.gameMode === 'practice' ? ['player1', 'ai'] : [payload.playerId];
                const newGame = gameService.createGame(playerIds, payload.gameMode);
                return NextResponse.json(newGame);
            }
            case 'playCard': {
                const { gameId, playerId, card, requestedShape } = payload;
                const gameState = gameService.playCard(gameId, playerId, card, requestedShape);
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
