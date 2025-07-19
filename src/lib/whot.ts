export type Shape = 'circle' | 'triangle' | 'cross' | 'square' | 'star' | 'whot';

export interface Card {
    id: number;
    shape: Shape;
    number: number;
}

// A full deck of Whot! cards
export const FULL_DECK: Card[] = [
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

export const STARTER_PACK: Card[] = [
    { id: 1, shape: 'circle', number: 5 },
    { id: 2, shape: 'triangle', number: 8 },
    { id: 3, shape: 'cross', number: 2 },
    { id: 4, shape: 'square', number: 10 },
    { id: 5, shape: 'star', number: 1 },
    { id: 6, shape: 'star', number: 4 },
    { id: 50, shape: 'whot', number: 20 },
    { id: 8, shape: 'triangle', number: 11 },
];
