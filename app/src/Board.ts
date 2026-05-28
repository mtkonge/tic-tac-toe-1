export type BoardPiece = { player: 0 | 1 | null };

export function initGrid(): BoardPiece[][] {
    return new Array(5).fill(0).map(
        () => new Array(5).fill(0).map(() => ({ player: null })),
    );
}

export type WinningResult = {
    playerWon: 0 | 1 | null;
    tie: boolean;
};

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
        let currentResult: WinningResult = { playerWon: null, tie: false };

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

                            // Bounds check
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

                        if (count === winLength) {
                            if (
                                currentResult.playerWon ===
                                    this.oppositePlayer(player)
                            ) {
                                return {
                                    playerWon: null,
                                    tie: true,
                                };
                            }
                            currentResult = {
                                playerWon: player,
                                tie: false,
                            };
                        }
                    }
                }
            }
        }

        // Check for tie (all cells filled)
        const tie = this.grid.every((row) =>
            row.every((cell) => cell.player !== null)
        );

        return {
            playerWon: null,
            tie,
        };
    }
}
