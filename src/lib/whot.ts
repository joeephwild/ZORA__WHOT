export type Shape = 'circle' | 'triangle' | 'cross' | 'square' | 'star' | 'whot';

export interface Card {
    id: string; // Changed to string to support UUIDs
    shape: Shape;
    number: number;
}

// A full deck of Whot! cards
export const FULL_DECK_TEMPLATE: Omit<Card, 'id'>[] = [
    // Circles
    { shape: 'circle', number: 1 }, { shape: 'circle', number: 2 }, { shape: 'circle', number: 3 }, { shape: 'circle', number: 4 }, { shape: 'circle', number: 5 }, { shape: 'circle', number: 7 }, { shape: 'circle', number: 8 }, { shape: 'circle', number: 10 }, { shape: 'circle', number: 11 }, { shape: 'circle', number: 12 }, { shape: 'circle', number: 13 }, { shape: 'circle', number: 14 },
    // Triangles
    { shape: 'triangle', number: 1 }, { shape: 'triangle', number: 2 }, { shape: 'triangle', number: 3 }, { shape: 'triangle', number: 4 }, { shape: 'triangle', number: 5 }, { shape: 'triangle', number: 7 }, { shape: 'triangle', number: 8 }, { shape: 'triangle', number: 10 }, { shape: 'triangle', number: 11 }, { shape: 'triangle', number: 12 }, { shape: 'triangle', number: 13 }, { shape: 'triangle', number: 14 },
    // Crosses
    { shape: 'cross', number: 1 }, { shape: 'cross', number: 2 }, { shape: 'cross', number: 3 }, { shape: 'cross', number: 5 }, { shape: 'cross', number: 7 }, { shape: 'cross', number: 10 }, { shape: 'cross', number: 11 }, { shape: 'cross', number: 13 }, { shape: 'cross', number: 14 },
    // Squares
    { shape: 'square', number: 1 }, { shape: 'square', number: 2 }, { shape: 'square', number: 3 }, { shape: 'square', number: 5 }, { shape: 'square', number: 7 }, { shape: 'square', number: 10 }, { shape: 'square', number: 11 }, { shape: 'square', number: 13 }, { shape: 'square', number: 14 },
    // Stars
    { shape: 'star', number: 1 }, { shape: 'star', number: 2 }, { shape: 'star', number: 3 }, { shape: 'star', number: 4 }, { shape: 'star', number: 5 }, { shape: 'star', number: 7 }, { shape: 'star', number: 8 },
    // Whot cards
    { shape: 'whot', number: 20 }, { shape: 'whot', number: 20 }, { shape: 'whot', number: 20 }, { shape: 'whot', number: 20 }, { shape: 'whot', number: 20 }
];

// Re-export FULL_DECK as Card[] for backward compatibility in some files
export const FULL_DECK: Card[] = FULL_DECK_TEMPLATE.map((c, i) => ({ ...c, id: (i + 1).toString() }));


export const STARTER_PACK: Card[] = [
    { id: 'starter-1', shape: 'circle', number: 5 },
    { id: 'starter-2', shape: 'triangle', number: 8 },
    { id: 'starter-3', shape: 'cross', number: 2 },
    { id: 'starter-4', shape: 'square', number: 10 },
    { id: 'starter-5', shape: 'star', number: 1 },
    { id: 'starter-6', shape: 'star', number: 4 },
    { id: 'starter-7', shape: 'whot', number: 20 },
    { id: 'starter-8', shape: 'triangle', number: 11 },
];
