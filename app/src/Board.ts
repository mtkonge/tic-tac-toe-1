// import from main instead
type V2 = { x: number; y: number };
type Circle = { pos: V2; radius: number };
type Piece = Circle & { velocity: V2 };

type Grid = Piece[];

export interface Board {
    hasWon(grid: Grid): boolean;
}
