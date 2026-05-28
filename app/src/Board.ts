// import from main instead
type V2 = { x: number; y: number };
type Circle = { pos: V2; radius: number };
type Piece = Circle & { velocity: V2 };
type Player = Circle & { aim: V2 | null };

type Cell = {
    player: Player | null;
};

type Grid = Cell[];

interface Board {
    hasWon(grid: Grid): boolean;
}
