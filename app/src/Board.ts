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

    private occupiedSpacesByEachPlayer(
        gridSize: number,
    ): { player0: number; player1: number } {
        const result = {
            player0: 0,
            player1: 0,
        };
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (this.grid[row][col].player === null) {
                    continue;
                }
                if (this.grid[row][col].player === 0) {
                    result.player0++;
                    continue;
                }
                result.player1++;
            }
        }
        return result;
    }

    hasWon(): WinningResult {
        const size = 5;
        const winLength = 3;
        let result: WinningResult = { playerWon: null, tie: false };

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

                        if (count === winLength) {
                            if (
                                result.playerWon ===
                                    this.oppositePlayer(player)
                            ) {
                                const totalCells = this
                                    .occupiedSpacesByEachPlayer(size);
                                if (totalCells.player0 > totalCells.player1) {
                                    return {
                                        playerWon: 0,
                                        tie: false,
                                    };
                                }
                                if (totalCells.player0 < totalCells.player1) {
                                    return {
                                        playerWon: 1,
                                        tie: false,
                                    };
                                }
                                return {
                                    playerWon: null,
                                    tie: true,
                                };
                            }
                            result = {
                                playerWon: player,
                                tie: false,
                            };
                        }
                    }
                }
            }
        }
        return result;
    }
}
