import type {
    Circle as CircleUnit,
    Square as SquareUnit,
    V2,
} from "./units.ts";
export type PlayerId = 0 | 1;
export type AimingPlayer = PlayerCircle & {
    tag: "player_aiming";
    aim: V2 | null;
    timer: number;
};
export type HasShotPlayer = {
    tag: "player_has_shot";
    previousPlayer: PlayerId;
};
export type PlayerCircle = CircleUnit & { player: PlayerId };
export type PlayerSquare = SquareUnit & { player: PlayerId };
