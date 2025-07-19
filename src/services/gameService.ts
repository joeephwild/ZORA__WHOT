/**
 * @fileoverview Manages the state and logic of the Whot! card game.
 * This service is responsible for creating games, handling player actions like
 * playing and drawing cards, and determining the game's flow.
 *
 * For simplicity, it uses an in-memory `games` object to store the state
 * of active games, with game IDs as keys. In a production scenario, this
 * would be replaced with a persistent database.
 */

import { v4 as uuidv4 } from 'uuid';
import { FULL_DECK } from '@/lib/whot';
import type { Card, Shape } from '@/lib/whot';
import type { GameRoom } from './lobbyService';


export interface PlayerState {
    id: string;
    hand: Card[];
}
export interface GameState {
    gameId: string;
    gameMode: 'practice' | 'staked' | 'free' | 'multiplayer';
    players: PlayerState[];
    // Backward compatibility for practice mode
    playerHand: Card[];
    aiHand: Card[];

    drawPile: Card[];
    discardPile: Card[];
    currentPlayerIndex: number;
    // Backward compatibility for practice mode
    currentPlayerId: string; 
    winner: string | null;
    requestedShape: Shape | null; // For when a Whot card is played
    lastMoveMessage: string | null; // To communicate what just happened
}

// In-memory store for active games
const games: Record<string, GameState> = {};

function shuffleDeck(deck: Card[]): Card[] {
    // Create a new array with unique IDs for each card instance to handle decks with duplicate cards
    const deckWithUniqueIds = deck.map((card, index) => ({ ...card, id: uuidv4() }));
    const shuffled = [...deckWithUniqueIds];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


function dealCards(deck: Card[], numCards: number): [Card[], Card[]] {
    const hand = deck.slice(0, numCards);
    const remainingDeck = deck.slice(numCards);
    return [hand, remainingDeck];
}

export function createGame(playerIds: string[], gameMode: GameState['gameMode']): GameState {
    const gameId = uuidv4();
    let deck = shuffleDeck(FULL_DECK);

    const players: PlayerState[] = [];
    let currentDeck = deck;

    for (const id of playerIds) {
        const [hand, remainingDeck] = dealCards(currentDeck, 5);
        players.push({ id, hand });
        currentDeck = remainingDeck;
    }
    
    let discardPile: Card[] = [];
    let drawPile = currentDeck;
    
    let firstCardIndex = -1;
    for(let i=0; i< drawPile.length; i++) {
        const card = drawPile[i];
        if(![1, 2, 5, 8, 14, 20].includes(card.number)) {
            firstCardIndex = i;
            break;
        }
    }

    if(firstCardIndex !== -1) {
        discardPile.push(drawPile[firstCardIndex]);
        drawPile.splice(firstCardIndex, 1);
    } else {
        const reshuffledDrawPile = shuffleDeck(drawPile);
        const firstCard = reshuffledDrawPile.pop()
        if (firstCard) {
            discardPile.push(firstCard);
        }
        drawPile = reshuffledDrawPile;
    }


    const gameState: GameState = {
        gameId,
        gameMode,
        players,
        // For practice mode compatibility
        playerHand: players.find(p => p.id === 'player1')?.hand || [],
        aiHand: players.find(p => p.id === 'ai')?.hand || [],
        drawPile,
        discardPile,
        currentPlayerIndex: 0,
        currentPlayerId: playerIds[0],
        winner: null,
        requestedShape: null,
        lastMoveMessage: `Game started. It's ${playerIds[0]}'s turn!`
    };

    games[gameId] = gameState;
    return gameState;
}


export function startGameFromRoom(room: GameRoom): GameState {
    if (room.status !== 'ready' || !room.guestId) {
        throw new Error('Room is not ready to start a game.');
    }
    const playerIds = [room.hostId, room.guestId];
    // Create a multiplayer game.
    const game = createGame(playerIds, room.gameMode);
    
    // Update room state
    room.gameId = game.gameId;
    room.status = 'in-progress';

    return game;
}

export function getGameState(gameId: string): GameState | undefined {
    return games[gameId];
}

export function isValidMove(playedCard: Card, topCard: Card, requestedShape: Shape | null): boolean {
    if (playedCard.shape === 'whot') return true;
    if (requestedShape) return playedCard.shape === requestedShape;
    return playedCard.shape === topCard.shape || playedCard.number === topCard.number;
}

function switchPlayer(game: GameState) {
    if(!game) return;
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    game.currentPlayerId = game.players[game.currentPlayerIndex].id;
}

export function playCard(gameId: string, playerId: string, card: Card, requestedShape?: Shape): GameState {
    const game = games[gameId];
    if (!game || game.winner) throw new Error('Game not found or has already ended.');
    if (game.currentPlayerId !== playerId) throw new Error('Not your turn.');

    const playerState = game.players.find(p => p.id === playerId);
    if (!playerState) throw new Error("Player not found in this game.");

    const hand = playerState.hand;
    const cardIndex = hand.findIndex(c => c.id === card.id);

    if (cardIndex === -1) throw new Error('Card not in hand.');

    const topCard = game.discardPile[game.discardPile.length - 1];
    if (!isValidMove(card, topCard, game.requestedShape)) {
        throw new Error(`Invalid move. You can't play a ${card.shape} ${card.number} on a ${game.requestedShape ? `requested shape ${game.requestedShape}` : `${topCard.shape} ${topCard.number}`}.`);
    }
    
    const [playedCard] = hand.splice(cardIndex, 1);
    game.discardPile.push(playedCard);
    game.requestedShape = null; 
    game.lastMoveMessage = `${playerId} played a ${playedCard.shape} ${playedCard.number}.`;


    if (hand.length === 0) {
        game.winner = playerId;
        game.lastMoveMessage = `${playerId} has won the game!`;
        return game;
    }

    let turnPasses = true;
    const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    const nextPlayerId = game.players[nextPlayerIndex].id;

    switch (playedCard.number) {
        case 1:
            game.lastMoveMessage += " Player gets another turn.";
            turnPasses = false;
            break;
        case 2:
            drawFromPile(game, nextPlayerId, 2);
            game.lastMoveMessage += ` ${nextPlayerId} picks two.`;
            break;
        case 5:
            drawFromPile(game, nextPlayerId, 3);
            game.lastMoveMessage += ` ${nextPlayerId} picks three.`;
            break;
        case 8:
            game.lastMoveMessage += ` ${nextPlayerId} is suspended.`;
            switchPlayer(game); // Skip the next player
            break;
        case 14:
            game.players.forEach(p => {
                if (p.id !== playerId) {
                    drawFromPile(game, p.id, 1);
                }
            });
            game.lastMoveMessage += " General Market! All opponents draw one.";
            break;
        case 20:
             if (requestedShape) {
                game.requestedShape = requestedShape;
                game.lastMoveMessage += ` Player requests ${requestedShape} and plays again.`;
             } else {
                throw new Error("A shape must be requested when playing a WHOT card.");
             }
            turnPasses = false;
            break;
    }
    
    if (turnPasses) {
        switchPlayer(game);
    }
    
    // For backward compatibility
    if (game.gameMode === 'practice') {
        game.playerHand = game.players.find(p => p.id === 'player1')?.hand || [];
        game.aiHand = game.players.find(p => p.id === 'ai')?.hand || [];
    }

    return game;
}

function drawFromPile(game: GameState, playerId: string, count: number) {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;

    for (let i = 0; i < count; i++) {
        if (game.drawPile.length === 0) {
            if (game.discardPile.length <= 1) break;
            const topCard = game.discardPile.pop()!;
            game.drawPile = shuffleDeck(game.discardPile);
            game.discardPile = [topCard];
        }
        if (game.drawPile.length > 0) {
            const [drawnCard] = game.drawPile.splice(0, 1);
            player.hand.push(drawnCard);
        }
    }
}


export function drawCard(gameId: string, playerId: string): GameState {
    const game = games[gameId];
    if (!game) throw new Error('Game not found.');
    if (game.currentPlayerId !== playerId) throw new Error('Not your turn to draw.');
    
    drawFromPile(game, playerId, 1);
    game.lastMoveMessage = `${playerId} drew a card.`;
    
    switchPlayer(game);
    
    // For practice mode backward compatibility
    if (game.gameMode === 'practice') {
        game.playerHand = game.players.find(p => p.id === 'player1')?.hand || [];
        game.aiHand = game.players.find(p => p.id === 'ai')?.hand || [];
    }

    return game;
}
