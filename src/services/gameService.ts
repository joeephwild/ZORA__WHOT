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
import type { Card, Shape } from '@/lib/whot';

// A full deck of Whot! cards
const FULL_DECK: Card[] = [
    // Circles
    { id: 1, shape: 'circle', number: 1 }, { id: 2, shape: 'circle', number: 2 }, { id: 3, shape: 'circle', number: 3 }, { id: 4, shape: 'circle', number: 4 }, { id: 5, shape: 'circle', number: 5 }, { id: 6, shape: 'circle', number: 7 }, { id: 7, shape: 'circle', number: 8 }, { id: 8, shape: 'circle', number: 10 }, { id: 9, shape: 'circle', number: 11 }, { id: 10, shape: 'circle', number: 12 }, { id: 11, shape: 'circle', number: 13 }, { id: 12, shape: 'circle', number: 14 },
    // Triangles
    { id: 13, shape: 'triangle', number: 1 }, { id: 14, shape: 'triangle', number: 2 }, { id: 15, shape: 'triangle', number: 3 }, { id: 16, shape: 'triangle', number: 4 }, { id: 17, shape: 'triangle', number: 5 }, { id: 18, shape: 'triangle', number: 7 }, { id: 19, shape: 'triangle', number: 8 }, { id: 20, shape: 'triangle', number: 10 }, { id: 21, shape: 'triangle', number: 11 }, { id: 22, shape: 'triangle', number: 12 }, { id: 23, shape: 'triangle', number: 13 }, { id: 24, shape: 'triangle', number: 14 },
    // Crosses
    { id: 25, shape: 'cross', number: 1 }, { id: 26, shape: 'cross', number: 2 }, { id: 27, shape: 'cross', number: 3 }, { id: 28, shape: 'cross', number: 5 }, { id: 29, shape: 'cross', number: 7 }, { id: 30, shape: 'cross', number: 10 }, { id: 31, shape: 'cross', number: 11 }, { id: 32, shape: 'cross', number: 13 }, { id: 33, shape: 'cross', number: 14 },
    // Squares
    { id: 34, shape: 'square', number: 1 }, { id: 35, shape: 'square', number: 2 }, { id: 36, shape: 'square', number: 3 }, { id: 37, shape: 'square', number: 5 }, { id: 38, shape: 'square', number: 7 }, { id: 39, shape: 'square', number: 10 }, { id: 40, shape: 'square', number: 11 }, { id: 41, shape: 'square', number: 13 }, { id: 42, shape: 'square', number: 14 },
    // Stars
    { id: 43, shape: 'star', number: 1 }, { id: 44, shape: 'star', number: 2 }, { id: 45, shape: 'star', number: 3 }, { id: 46, shape: 'star', number: 4 }, { id: 47, shape: 'star', number: 5 }, { id: 48, shape: 'star', number: 7 }, { id: 49, shape: 'star', number: 8 },
    // Whot cards
    { id: 50, shape: 'whot', number: 20 }, { id: 51, shape: 'whot', number: 20 }, { id: 52, shape: 'whot', number: 20 }, { id: 53, shape: 'whot', number: 20 }, { id: 54, shape: 'whot', number: 20 }
];

export interface GameState {
    gameId: string;
    gameMode: 'practice' | 'staked' | 'free';
    playerHand: Card[];
    aiHand: Card[];
    drawPile: Card[];
    discardPile: Card[];
    currentPlayerId: string;
    winner: string | null;
    requestedShape: Shape | null; // For when a Whot card is played
}

// In-memory store for active games
const games: Record<string, GameState> = {};

function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
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

export function createGame(playerId: string, gameMode: 'practice' | 'staked' | 'free'): GameState {
    const gameId = uuidv4();
    let deck = shuffleDeck(FULL_DECK);

    const [playerHand, deckAfterPlayer] = dealCards(deck, 5);
    const [aiHand, deckAfterAi] = dealCards(deckAfterPlayer, 5);

    let discardPile: Card[] = [];
    let drawPile = deckAfterAi;
    
    // Ensure the first card on the discard pile is not a special card
    let firstCardIndex = -1;
    for(let i=0; i< drawPile.length; i++) {
        const card = drawPile[i];
        if(![1,2,5,8,14,20].includes(card.number)) {
            firstCardIndex = i;
            break;
        }
    }

    if(firstCardIndex !== -1) {
        discardPile.push(drawPile[firstCardIndex]);
        drawPile.splice(firstCardIndex, 1);
    } else {
        // Highly unlikely case where all cards are special, just start with any card
        discardPile.push(drawPile.pop()!);
    }


    const gameState: GameState = {
        gameId,
        gameMode,
        playerHand,
        aiHand,
        drawPile,
        discardPile,
        currentPlayerId: playerId, // Player starts
        winner: null,
        requestedShape: null
    };

    games[gameId] = gameState;
    return gameState;
}

export function getGameState(gameId: string): GameState | undefined {
    return games[gameId];
}

function isValidMove(playedCard: Card, topCard: Card, requestedShape: Shape | null): boolean {
    if (playedCard.shape === 'whot') return true;
    if (requestedShape) return playedCard.shape === requestedShape;
    return playedCard.shape === topCard.shape || playedCard.number === topCard.number;
}

function switchPlayer(gameId: string, currentPlayerId: string) {
    const game = games[gameId];
    if(!game) return;
    const { playerHand } = game;
    // In a real game, we'd have a list of players. Here we just toggle.
    game.currentPlayerId = currentPlayerId === 'ai' ? playerHand[0]?.id.toString() ?? "player" : 'ai';
}

export function playCard(gameId: string, playerId: string, card: Card): GameState {
    const game = games[gameId];
    if (!game || game.winner) throw new Error('Game not found or has already ended.');
    if (game.currentPlayerId !== playerId) throw new Error('Not your turn.');

    const hand = playerId === 'ai' ? game.aiHand : game.playerHand;
    const cardIndex = hand.findIndex(c => c.id === card.id);

    if (cardIndex === -1) throw new Error('Card not in hand.');

    const topCard = game.discardPile[game.discardPile.length - 1];
    if (!isValidMove(card, topCard, game.requestedShape)) {
        throw new Error('Invalid move.');
    }
    
    // Move card from hand to discard pile
    const [playedCard] = hand.splice(cardIndex, 1);
    game.discardPile.push(playedCard);
    game.requestedShape = null; // Reset requested shape after a valid move

    // Check for winner
    if (hand.length === 0) {
        game.winner = playerId;
        return game;
    }

    // Handle special card actions
    switch (playedCard.number) {
        case 1: // Hold On
            // Current player plays again, so we don't switch.
            return game;
        case 2: // Pick Two
            switchPlayer(gameId, playerId);
             drawCard(gameId, game.currentPlayerId, 2);
            break;
        case 5: // Pick Three (not a standard Whot! rule, but can be a variant)
            // No action in standard rules, but you could implement one here
            break;
        case 8: // Suspension
            switchPlayer(gameId, playerId); // Skip next player
            break;
        case 14: // General Market
             drawCard(gameId, playerId === 'ai' ? game.playerHand[0]?.id.toString() ?? "player" : 'ai', 1);
            break;
        case 20: // Whot!
            // The frontend should ask the player for a shape.
            // For the AI, the AI flow will decide this.
            // For now, we assume the next action will set `requestedShape`.
            return game; // Player plays again
        default:
            switchPlayer(gameId, playerId);
    }
    
    return game;
}

export function drawCard(gameId: string, playerId: string, count = 1): GameState {
    const game = games[gameId];
    if (!game) throw new Error('Game not found.');
    
    const hand = playerId === 'ai' ? game.aiHand : game.playerHand;

    for (let i = 0; i < count; i++) {
        if (game.drawPile.length === 0) {
            // Reshuffle discard pile into draw pile
            if (game.discardPile.length <= 1) break; // Not enough cards to reshuffle
            const topCard = game.discardPile.pop()!;
            game.drawPile = shuffleDeck(game.discardPile);
            game.discardPile = [topCard];
        }
        const [drawnCard] = game.drawPile.splice(0, 1);
        hand.push(drawnCard);
    }

    switchPlayer(gameId, playerId);
    return game;
}

export function setRequestedShape(gameId: string, playerId: string, shape: Shape): GameState {
    const game = games[gameId];
    if (!game) throw new Error('Game not found.');
    const lastPlayedCard = game.discardPile[game.discardPile.length - 1];
    if (lastPlayedCard.shape !== 'whot') {
        throw new Error('Cannot request shape unless a Whot card was played.');
    }
    game.requestedShape = shape;
    // After requesting a shape, the turn passes to the next player.
    switchPlayer(gameId, playerId);
    return game;
}
