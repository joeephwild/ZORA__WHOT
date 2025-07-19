'use server';
import { NextRequest, NextResponse } from 'next/server';
import * as gameService from '@/services/gameService';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get('gameId');

        if (!gameId) {
            return NextResponse.json({ message: 'gameId is required' }, { status: 400 });
        }

        const gameState = gameService.getGameState(gameId);
        if (!gameState) {
            return NextResponse.json({ message: 'Game not found' }, { status: 404 });
        }

        return NextResponse.json(gameState);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ message: 'An error occurred', error: error.message }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        switch (action) {
            case 'newGame': {
                const gameMode = payload.gameMode || 'practice';
                const playerIds = gameMode === 'practice' ? ['player1', 'ai'] : payload.playerIds;
                const newGame = gameService.createGame(playerIds, gameMode);
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
        return NextResponse.json({ message: error.message || 'An error occurred' }, { status: 500 });
    }
}
