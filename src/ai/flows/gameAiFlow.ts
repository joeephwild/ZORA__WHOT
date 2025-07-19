'use server';
/**
 * @fileOverview A Genkit flow for the Whot! game AI opponent.
 * This flow decides which card the AI should play based on its hand and the
 * current state of the game.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Card, Shape } from '@/lib/whot';

// Zod schema for individual cards
const CardSchema = z.object({
    id: z.string(),
    shape: z.enum(['circle', 'triangle', 'cross', 'square', 'star', 'whot']),
    number: z.number(),
});

// Input schema for the AI move flow
const AiMoveInputSchema = z.object({
  aiHand: z.array(CardSchema).describe("The AI's current hand of cards."),
  discardPileTopCard: CardSchema.describe('The card currently at the top of the discard pile.'),
  validMoves: z.array(CardSchema).describe('The subset of cards in the AI hand that are valid to play. If this is empty, the AI must draw.'),
  requestedShape: z.enum(['circle', 'triangle', 'cross', 'square', 'star']).nullable().describe("The shape requested by the previous player if they played a WHOT card. This overrides the discard pile's shape."),
});
export type AiMoveInput = z.infer<typeof AiMoveInputSchema>;


// Output schema for the AI move flow
const AiMoveOutputSchema = z.object({
  cardToPlay: CardSchema.optional().describe('The card the AI has decided to play. If no card is played (because there are no valid moves), the AI must draw.'),
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
    {{#if requestedShape}}
    - The active requested shape is: {{{requestedShape}}}
    {{/if}}
    
    Here are the cards you can legally play from your hand:
    {{{json validMoves}}}

    Analyze your hand and the discard pile, then decide which card to play.
    - **Strategy**: Prioritize getting rid of high-number cards and special cards (like 1, 2, 8, 14) that can disrupt your opponent. If you have multiple options, consider which play leaves you in a better position for your next turn.
    - **Playing a "Whot" card (number 20)** is a powerful move, as you get to choose the next shape and play again. If you play a Whot card, you MUST set the requestedShape field in your response. To choose the shape, look at your remaining hand and pick the shape you have the most of.
    - **No Valid Moves**: If the list of validMoves is empty, you cannot play a card. In this case, do not select a cardToPlay and state in your reasoning that you must draw a card.

    Provide your decision in the specified JSON format. Your reasoning should be concise.
  `,
});


const gameAiFlow = ai.defineFlow(
  {
    name: 'gameAiFlow',
    inputSchema: AiMoveInputSchema,
    outputSchema: AiMoveOutputSchema,
  },
  async (input) => {
    
    if (input.validMoves.length === 0) {
        return { reasoning: "I have no valid moves, so I must draw a card." };
    }

    const { output } = await prompt(input);
    
    // If the AI decides to play a WHOT card, but fails to specify a requested shape,
    // let's add some fallback logic.
    if (output?.cardToPlay?.shape === 'whot' && !output.requestedShape) {
        const remainingHand = input.aiHand.filter(c => c.id !== output!.cardToPlay!.id);
        const shapeCounts: Record<string, number> = {};
        for (const card of remainingHand) {
            if (card.shape !== 'whot') {
                shapeCounts[card.shape] = (shapeCounts[card.shape] || 0) + 1;
            }
        }
        // Find the most common shape, default to 'circle' if hand is empty or only has whot cards
        const bestShape = Object.keys(shapeCounts).reduce((a, b) => shapeCounts[a] > shapeCounts[b] ? a : b, 'circle');
        output.requestedShape = bestShape as Shape;
        output.reasoning += ` (Fallback: Chose ${bestShape} as it's the most common in my hand).`
    }
    
    return output!;
  }
);
