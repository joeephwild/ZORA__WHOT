'use server';
import { NextRequest, NextResponse } from 'next/server';
import * as lobbyService from '@/services/lobbyService';
import * as gameService from '@/services/gameService';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get('roomId');

        if (roomId) {
            const room = lobbyService.getRoom(roomId);
            if(room) {
                return NextResponse.json({ room });
            }
            return NextResponse.json({ message: 'Room not found' }, { status: 404 });
        }

        const rooms = lobbyService.getRooms();
        return NextResponse.json({ rooms });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching data', error: error.message }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        switch (action) {
            case 'createRoom': {
                const { hostId, gameMode } = payload;
                const newRoom = lobbyService.createRoom(hostId, gameMode);
                return NextResponse.json(newRoom);
            }
            case 'joinRoom': {
                const { roomId, guestId } = payload;
                const updatedRoom = lobbyService.joinRoom(roomId, guestId);
                if (!updatedRoom) {
                    return NextResponse.json({ message: "Could not join room. It might be full or no longer available." }, { status: 400 });
                }
                // When a guest joins, the game starts
                const game = gameService.startGameFromRoom(updatedRoom);
                return NextResponse.json({ room: updatedRoom, gameId: game.gameId });
            }
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Lobby API Error:', error);
        return NextResponse.json({ message: 'An error occurred in the lobby', error: error.message }, { status: 500 });
    }
}