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
].map(card => ({ ...card, uid: uuidv4() }));


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
    lastMoveMessage: string | null; // To communicate what just happened
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
        if(![1, 2, 5, 8, 14, 20].includes(card.number)) {
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
        requestedShape: null,
        lastMoveMessage: "Game started. Your turn!"
    };

    games[gameId] = gameState;
    return gameState;
}

export function getGameState(gameId: string): GameState | undefined {
    return games[gameId];
}

export function isValidMove(playedCard: Card, topCard: Card, requestedShape: Shape | null): boolean {
    if (playedCard.shape === 'whot') return true;
    if (requestedShape) return playedCard.shape === requestedShape;
    return playedCard.shape === topCard.shape || playedCard.number === topCard.number;
}

function switchPlayer(game: GameState, currentPlayerId: string) {
    if(!game) return;
    game.currentPlayerId = currentPlayerId === 'ai' ? 'player1' : 'ai';
}

export function playCard(gameId: string, playerId: string, card: Card, requestedShape?: Shape): GameState {
    const game = games[gameId];
    if (!game || game.winner) throw new Error('Game not found or has already ended.');
    if (game.currentPlayerId !== playerId) throw new Error('Not your turn.');

    const hand = playerId === 'ai' ? game.aiHand : game.playerHand;
    const cardIndex = hand.findIndex(c => c.id === card.id);

    if (cardIndex === -1) throw new Error('Card not in hand.');

    const topCard = game.discardPile[game.discardPile.length - 1];
    if (!isValidMove(card, topCard, game.requestedShape)) {
        throw new Error(`Invalid move. You can't play a ${card.shape} ${card.number} on a ${topCard.shape} ${topCard.number}.`);
    }
    
    // Move card from hand to discard pile
    const [playedCard] = hand.splice(cardIndex, 1);
    game.discardPile.push(playedCard);
    game.requestedShape = null; // Reset requested shape after a valid move is made
    game.lastMoveMessage = `${playerId} played a ${playedCard.shape} ${playedCard.number}.`;


    // Check for winner
    if (hand.length === 0) {
        game.winner = playerId;
        game.lastMoveMessage = `${playerId} has won the game!`;
        return game;
    }

    // Handle special card actions
    let nextPlayerGetsTurn = true;

    switch (playedCard.number) {
        case 1: // Hold On
            game.lastMoveMessage += " Player gets another turn.";
            nextPlayerGetsTurn = false; // Current player plays again
            break;
        case 2: // Pick Two
            const opponentId2 = playerId === 'ai' ? 'player1' : 'ai';
            drawFromPile(game, opponentId2, 2);
            game.lastMoveMessage += ` ${opponentId2} picks two.`;
            break;
        case 5: // Pick Three
            const opponentId5 = playerId === 'ai' ? 'player1' : 'ai';
            drawFromPile(game, opponentId5, 3);
            game.lastMoveMessage += ` ${opponentId5} picks three.`;
            break;
        case 8: // Suspension
            const opponentId8 = playerId === 'ai' ? 'player1' : 'ai';
            game.lastMoveMessage += ` ${opponentId8} is suspended.`;
            // Skip next player, so the current player plays again
            nextPlayerGetsTurn = false;
            break;
        case 14: // General Market
            // All other players draw one card.
            const opponentId14 = playerId === 'ai' ? 'player1' : 'ai';
            drawFromPile(game, opponentId14, 1);
            game.lastMoveMessage += " General Market! Other players draw one.";
            break;
        case 20: // Whot!
             if (requestedShape) {
                game.requestedShape = requestedShape;
                game.lastMoveMessage += ` Player requests ${requestedShape}.`;
             } else {
                // This should not happen if the logic is correct.
                // The AI provides the shape, the UI prompts the user.
                throw new Error("A shape must be requested when playing a WHOT card.");
             }
            nextPlayerGetsTurn = false; // Player who played Whot! goes again
            break;
    }
    
    if (nextPlayerGetsTurn) {
        switchPlayer(game, playerId);
    }

    return game;
}

function drawFromPile(game: GameState, playerId: string, count: number) {
     const hand = playerId === 'ai' ? game.aiHand : game.playerHand;

    for (let i = 0; i < count; i++) {
        if (game.drawPile.length === 0) {
            // Reshuffle discard pile into draw pile
            if (game.discardPile.length <= 1) break; // Not enough cards to reshuffle
            const topCard = game.discardPile.pop()!;
            game.drawPile = shuffleDeck(game.discardPile.slice(0, -1));
            game.discardPile = [topCard];
        }
        if (game.drawPile.length > 0) {
            const [drawnCard] = game.drawPile.splice(0, 1);
            hand.push(drawnCard);
        }
    }
}


export function drawCard(gameId: string, playerId: string): GameState {
    const game = games[gameId];
    if (!game) throw new Error('Game not found.');
    if (game.currentPlayerId !== playerId) throw new Error('Not your turn to draw.');
    
    drawFromPile(game, playerId, 1);
    game.lastMoveMessage = `${playerId} drew a card.`;
    
    // After drawing, the turn passes to the next player.
    switchPlayer(game, playerId);
    return game;
}
