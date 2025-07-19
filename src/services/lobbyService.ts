/**
 * @fileoverview Manages the state of game lobbies and rooms for multiplayer.
 * This service is responsible for creating, joining, and tracking game rooms
 * before a match begins.
 *
 * For simplicity, it uses an in-memory `rooms` object to store the state
 * of active rooms. In a production scenario, this would be replaced with a
 * persistent, real-time database (e.g., Firestore) to handle multiple users
 * and server instances.
 */

import { v4 as uuidv4 } from 'uuid';

export interface GameRoom {
    roomId: string;
    hostId: string;
    guestId: string | null;
    gameMode: 'staked' | 'free';
    createdAt: number;
    status: 'waiting' | 'ready' | 'in-progress';
}

// In-memory store for active game rooms
const rooms: Record<string, GameRoom> = {};

/**
 * Creates a new game room and adds it to the lobby.
 * @param hostId The ID of the player creating the room.
 * @param gameMode The type of match (staked or free).
 * @returns The newly created GameRoom object.
 */
export function createRoom(hostId: string, gameMode: 'staked' | 'free'): GameRoom {
    const roomId = uuidv4();
    const newRoom: GameRoom = {
        roomId,
        hostId,
        guestId: null,
        gameMode,
        createdAt: Date.now(),
        status: 'waiting',
    };
    rooms[roomId] = newRoom;
    console.log(`Room created: ${roomId} by ${hostId}`);
    return newRoom;
}

/**
 * Retrieves a list of all currently open (waiting) game rooms.
 * @returns An array of GameRoom objects.
 */
export function getRooms(): GameRoom[] {
    // Filter out old rooms that might be stuck, e.g., older than 1 hour
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    Object.keys(rooms).forEach(roomId => {
        if (now - rooms[roomId].createdAt > oneHour) {
            delete rooms[roomId];
        }
    });

    return Object.values(rooms).filter(room => room.status === 'waiting');
}

/**
 * Retrieves a specific game room by its ID.
 * @param roomId The ID of the room to retrieve.
 * @returns The GameRoom object or undefined if not found.
 */
export function getRoom(roomId: string): GameRoom | undefined {
    return rooms[roomId];
}

/**
 * Adds a guest player to a game room.
 * @param roomId The ID of the room to join.
 * @param guestId The ID of the player joining.
 * @returns The updated GameRoom object.
 */
export function joinRoom(roomId: string, guestId: string): GameRoom | null {
    const room = rooms[roomId];
    if (room && room.status === 'waiting' && !room.guestId) {
        room.guestId = guestId;
        room.status = 'ready'; // Both players are now in the room
        console.log(`Player ${guestId} joined room ${roomId}`);
        return room;
    }
    // Room not found, already full, or game has started
    return null; 
}

/**
 * Deletes a game room from the store.
 * @param roomId The ID of the room to delete.
 */
export function deleteRoom(roomId: string): void {
    if (rooms[roomId]) {
        delete rooms[roomId];
        console.log(`Room deleted: ${roomId}`);
    }
}
