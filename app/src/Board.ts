import { PlayerId } from "./player.ts";

export type BoardPiece = { player: 0 | 1 | null };

export function initGrid(): BoardPiece[][] {
    return new Array(5).fill(0).map(
        () => new Array(5).fill(0).map(() => ({ player: null })),
    );
}

export type WinningResult =
    | {
        tag: "none";
    }
    | { tag: "tie" }
    | { tag: "winner"; winner: PlayerId };

export interface Board {
    hasWon(): WinningResult;
}

export class TicTacToeBoard implements Board {
    constructor(private grid: BoardPiece[][]) {}

    private oppositePlayer(player: 1 | 0) {
        if (player === 1) {
            return 0;
        }
        return 1;
    }

    hasWon(): WinningResult {
        const size = 5;
        const winLength = 3;
        let currentResult = { tag: "none" } as WinningResult;

        const directions = [
            [0, 1],
            [1, 0],
            [1, 1],
            [1, -1],
        ];

        for (const player of [0, 1] as const) {
            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    if (this.grid[row][col].player !== player) {
                        continue;
                    }

                    for (const [dr, dc] of directions) {
                        let count = 0;

                        for (let i = 0; i < winLength; i++) {
                            const r = row + dr * i;
                            const c = col + dc * i;

                            if (
                                r >= 0 &&
                                r < size &&
                                c >= 0 &&
                                c < size &&
                                this.grid[r][c].player === player
                            ) {
                                count++;
                            } else {
                                break;
                            }
                        }

                        console.log(count);
                        if (count === winLength) {
                            if (
                                currentResult.tag === "winner" &&
                                currentResult.winner ===
                                    this.oppositePlayer(player)
                            ) {
                                return { tag: "tie" };
                            }
                            currentResult = { tag: "winner", winner: player };
                        }
                    }
                }
            }
        }
        return currentResult;
    }
}
