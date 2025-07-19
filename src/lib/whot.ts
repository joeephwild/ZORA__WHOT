export type Shape = 'circle' | 'triangle' | 'cross' | 'square' | 'star' | 'whot';

export interface Card {
    id: number;
    shape: Shape;
    number: number;
}

export const STARTER_PACK: Card[] = [
    { id: 1, shape: 'circle', number: 5 },
    { id: 2, shape: 'triangle', number: 8 },
    { id: 3, shape: 'cross', number: 2 },
    { id: 4, shape: 'square', number: 10 },
    { id: 5, shape: 'star', number: 1 },
    { id: 6, shape: 'star', number: 4 },
    { id: 7, shape: 'whot', number: 20 },
    { id: 8, shape: 'triangle', number: 11 },
];

export const PLAYER_HAND: Card[] = [
    { id: 10, shape: 'cross', number: 1 },
    { id: 11, shape: 'square', number: 7 },
    { id: 12, shape: 'circle', number: 12 },
    { id: 13, shape: 'triangle', number: 3 },
    { id: 14, shape: 'star', number: 5 },
]

export const AI_HAND: Card[] = [
    { id: 20, shape: 'cross', number: 1 },
    { id: 21, shape: 'square', number: 7 },
    { id: 22, shape: 'circle', number: 12 },
    { id: 23, shape: 'triangle', number: 3 },
    { id: 24, shape: 'star', number: 5 },
]

export const DRAW_PILE_TOP_CARD: Card = { id: 30, shape: 'triangle', number: 5 };
export const DISCARD_PILE_TOP_CARD: Card = { id: 31, shape: 'triangle', number: 1 };
