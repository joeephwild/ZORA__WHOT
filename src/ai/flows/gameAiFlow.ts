'use server';
/**
 * @fileOverview A Genkit flow for the Whot! game AI opponent.
 * This flow decides which card the AI should play based on its hand and the
 * current state of the game.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Card } from '@/lib/whot';

// Zod schema for individual cards
const CardSchema = z.object({
    id: z.number(),
    shape: z.enum(['circle', 'triangle', 'cross', 'square', 'star', 'whot']),
    number: z.number(),
});

// Input schema for the AI move flow
const AiMoveInputSchema = z.object({
  aiHand: z.array(CardSchema).describe("The AI's current hand of cards."),
  discardPileTopCard: CardSchema.describe('The card currently at the top of the discard pile.'),
  validMoves: z.array(CardSchema).describe('The subset of cards in the AI hand that are valid to play.'),
});
export type AiMoveInput = z.infer<typeof AiMoveInputSchema>;


// Output schema for the AI move flow
const AiMoveOutputSchema = z.object({
  cardToPlay: CardSchema.optional().describe('The card the AI has decided to play. If no card is played, the AI must draw.'),
  reasoning: z.string().describe('A brief explanation of why the AI chose this card.'),
  requestedShape: z.enum(['circle', 'triangle', 'cross', 'square', 'star']).optional().describe('If the AI plays a WHOT card, it must request a shape for the next player.')
});
export type AiMoveOutput = z.infer<typeof AiMoveOutputSchema>;

export async function makeAiMove(input: AiMoveInput): Promise<AiMoveOutput> {
  return gameAiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'whotAiPrompt',
  input: { schema: AiMoveInputSchema },
  output: { schema: AiMoveOutputSchema },
  prompt: `
    You are an AI player in a game of Whot!. Your goal is to win by getting rid of all your cards.
    
    Here is the current state of the game:
    - Your hand: {{{json aiHand}}}
    - Top of discard pile: {{{json discardPileTopCard}}}
    
    Here are the cards you can legally play:
    {{{json validMoves}}}

    Analyze your hand and the discard pile, then decide which card to play.
    - **Strategy**: Prioritize getting rid of high-number cards and special cards that can disrupt your opponent. If you have multiple options, consider which play leaves you in a better position. Playing a "Whot" (number 20) card is a powerful move, as you get to choose the next shape. If you play a Whot card, you MUST set the requestedShape field. Choose the shape you have the most of in your remaining hand.
    - **No Valid Moves**: If you have no valid moves from the list provided, you must draw a card. In this case, do not select a cardToPlay.

    Provide your decision in the specified JSON format.
  `,
});


const gameAiFlow = ai.defineFlow(
  {
    name: 'gameAiFlow',
    inputSchema: AiMoveInputSchema,
    outputSchema: AiMoveOutputSchema,
  },
  async (input) => {
    
    // A simple validation to determine valid moves for the AI.
    // In a real app, this logic might be shared with the frontend.
    const topCard = input.discardPileTopCard;
    const validMoves = input.aiHand.filter(card => 
        card.shape === 'whot' || card.shape === topCard.shape || card.number === topCard.number
    );

    if (validMoves.length === 0) {
        return { reasoning: "No valid moves available, so I must draw a card." };
    }

    const { output } = await prompt({
        ...input,
        validMoves, // Pass the dynamically calculated valid moves to the prompt
    });
    
    return output!;
  }
);
