import { assertEquals } from "@std/assert";
import { BoardPiece, initGrid, TicTacToeBoard } from "./Board.ts";

Deno.test("top to bottom cross win condition", () => {
    const grid: BoardPiece[][] = initGrid();

    grid[1][1] = { player: 1 };
    grid[2][2] = { player: 1 };
    grid[3][3] = { player: 1 };

    const board = new TicTacToeBoard(grid);
    assertEquals(board.hasWon(), { playerWon: 1, tie: false });
});

Deno.test("bottom to top cross win condition", () => {
    const grid: BoardPiece[][] = initGrid();

    grid[3][1] = { player: 0 };
    grid[2][2] = { player: 0 };
    grid[1][3] = { player: 0 };

    const board = new TicTacToeBoard(grid);
    assertEquals(board.hasWon(), { playerWon: 0, tie: false });
});

Deno.test("vertical win condition", () => {
    const grid: BoardPiece[][] = initGrid();

    grid[1][2] = { player: 0 };
    grid[2][2] = { player: 0 };
    grid[3][2] = { player: 0 };

    const board = new TicTacToeBoard(grid);
    assertEquals(board.hasWon(), { playerWon: 0, tie: false });
});

Deno.test("horizontal win condition", () => {
    const grid: BoardPiece[][] = initGrid();

    grid[1][2] = { player: 1 };
    grid[2][2] = { player: 1 };
    grid[3][2] = { player: 1 };

    const board = new TicTacToeBoard(grid);
    assertEquals(board.hasWon(), { playerWon: 1, tie: false });
});
