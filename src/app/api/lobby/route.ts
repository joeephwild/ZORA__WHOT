'use server';
import { NextRequest, NextResponse } from 'next/server';
import * as lobbyService from '@/services/lobbyService';

export async function GET(req: NextRequest) {
    try {
        const rooms = lobbyService.getRooms();
        return NextResponse.json({ rooms });
    } catch (error: any) {
        return NextResponse.json({ message: 'Error fetching rooms', error: error.message }, { status: 500 });
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
            // Other actions like 'joinRoom' will be added later
            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('Lobby API Error:', error);
        return NextResponse.json({ message: 'An error occurred in the lobby', error: error.message }, { status: 500 });
    }
}
