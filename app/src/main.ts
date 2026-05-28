import {
    AimingPlayer,
    HasShotPlayer,
    PlayerCircle,
    PlayerId,
    PlayerSquare,
} from "./player.ts";
import { availableSkins } from "./skins.ts";
import {
    intersectsCircle,
    intersectsPoint,
    intersectsSquare,
    pointDist,
    type V2,
} from "./units.ts";

type Piece = PlayerCircle & { velocity: V2 };

const skins = availableSkins();

type Grid = {
    width: number;
    height: number;
    unit: number;
};

function v2sub(lhs: V2, rhs: V2) {
    return { x: lhs.x - rhs.x, y: lhs.y - rhs.y };
}

function v2add(lhs: V2, rhs: V2) {
    return { x: lhs.x + rhs.x, y: lhs.y + rhs.y };
}

type LogicGrid = LogicGridItem[][];
type LogicGridItem = {
    tag: "occupied";
    player: PlayerId;
} | {
    tag: "unoccupied";
};

class StateMasterControllerLogicHandlerBusiness {
    private ctx: CanvasRenderingContext2D;
    private grid: Grid = { unit: 80, width: 5, height: 5 };
    private player: AimingPlayer | HasShotPlayer;
    private pieces: Piece[] = [];

    public selectedSkin = skins[0];

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d")!;
        this.player = this.createPlayer(0);
        this.ctx.lineWidth = 2;

        document.addEventListener("mouseup", (ev) => {
            if (ev.button !== 0) return;
            this.playHitSound();
            this.shoot();
        });
        document.addEventListener("mousedown", (ev) => {
            if (ev.button !== 0) return;
            if (this.player.tag === "player_has_shot") return;
            if (!intersectsPoint(this.mousePos(ev), this.player)) return;
            const delta = v2sub(this.mousePos(ev), this.player.pos);
            this.player.aim = { x: -delta.x, y: -delta.y };
        });

        document.addEventListener("mousemove", (ev) => {
            if (ev.button !== 0) return;
            if (
                this.player.tag !== "player_aiming" || this.player.aim === null
            ) {
                return;
            }
            const delta = v2sub(this.mousePos(ev), this.player.pos);
            this.player.aim = { x: -delta.x, y: -delta.y };
        });

        setInterval(() => {
            this.update();
        });

        const renderCb = () => {
            this.render();
            requestAnimationFrame(renderCb);
        };
        requestAnimationFrame(renderCb);
    }

    private buildLogicGrid(): LogicGrid {
        const gridX = (this.canvas.width - this.grid.width * this.grid.unit) /
            2;
        const grid: LogicGrid = [];
        for (let xIdx = 0; xIdx < this.grid.width; ++xIdx) {
            grid.push([]);
            for (let yIdx = 0; yIdx < this.grid.height; ++yIdx) {
                const x = xIdx * this.grid.unit + gridX;
                const y = yIdx * this.grid.unit + 24;
                const gridCenter = {
                    x: x + this.grid.unit / 2,
                    y: y + this.grid.unit / 2,
                };
                const candidates = this.pieces
                    .filter((p) => {
                        return intersectsSquare(p.pos, {
                            pos: { x, y },
                            size: { x: this.grid.unit, y: this.grid.unit },
                        });
                    })
                    .sort((lhs, rhs) =>
                        pointDist(lhs.pos, gridCenter) -
                        pointDist(rhs.pos, gridCenter)
                    );

                const winner = candidates.at(0);
                if (winner !== undefined) {
                    grid[xIdx].push({
                        tag: "occupied",
                        player: winner.player,
                    });
                } else {
                    grid[xIdx].push({
                        tag: "unoccupied",
                    });
                }
            }
        }
        return grid;
    }

    private renderCircle(circle: PlayerCircle, ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(circle.pos.x, circle.pos.y, circle.radius, 0, Math.PI * 2);
        ctx.clip();
        const square = {
            size: { x: circle.radius * 2, y: circle.radius * 2 },
            pos: {
                x: circle.pos.x - circle.radius,
                y: circle.pos.y - circle.radius,
            },
            player: circle.player,
        } satisfies PlayerSquare;
        this.selectedSkin.render(square, ctx);
        ctx.restore();
        ctx.strokeStyle = "#444";
        ctx.beginPath();
        ctx.arc(circle.pos.x, circle.pos.y, circle.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    private mousePos({ clientX, clientY }: MouseEvent): V2 {
        const x = this.canvas.getBoundingClientRect().left;
        const y = this.canvas.getBoundingClientRect().top;
        const width = this.canvas.getBoundingClientRect().width;
        const height = this.canvas.getBoundingClientRect().height;
        const coords: V2 = {
            x: ((clientX - x) / width) * this.canvas.width,
            y: ((clientY - y) / height) * this.canvas.height,
        };

        return coords;
    }

    private swapPlayer() {
        const id = this.player.tag === "player_aiming"
            ? this.player.player
            : this.player.previousPlayer;
        switch (id) {
            case 0:
                this.player = this.createPlayer(1);
                break;

            case 1:
                this.player = this.createPlayer(0);
                break;
        }
    }

    private createPlayer(player: PlayerId): AimingPlayer {
        return {
            tag: "player_aiming",
            pos: { x: this.canvas.width / 2, y: 850 },
            radius: 25,
            aim: null,
            player,
            timer: 30,
        } satisfies AimingPlayer;
    }

    private shoot() {
        if (this.player.tag !== "player_aiming" || this.player.aim === null) {
            return;
        }
        const velocityModifier = 1.5;

        const calc = (x: number) =>
            (Math.abs(x) ** velocityModifier) * Math.sign(x);

        const piece = {
            pos: this.player.pos,
            radius: this.player.radius,
            velocity: {
                x: calc(this.player.aim.x),
                y: calc(this.player.aim.y),
            },
            player: this.player.player,
        } satisfies Piece;
        this.pieces.push(piece);
        this.player = {
            tag: "player_has_shot",
            previousPlayer: this.player.player,
        };
    }

    private lastTick = Temporal.Now.instant();
    private update() {
        const now = Temporal.Now.instant();
        const deltaTime = now.since(this.lastTick).milliseconds / 1000;

        for (let i = 0; i < this.pieces.length; ++i) {
            for (let j = i + 1; j < this.pieces.length; ++j) {
                const piece0 = this.pieces[i];
                const piece1 = this.pieces[j];
                if (piece0 === piece1) throw new Error("unreachable");
                if (!intersectsCircle(piece0, piece1)) continue;
                this.playHitSound();
                const p0v = piece0.velocity;
                const p1v = piece1.velocity;
                piece0.velocity = p1v;
                piece1.velocity = p0v;
            }
        }
        for (const piece of this.pieces) {
            piece.pos.x += piece.velocity.x * deltaTime;
            piece.pos.y += piece.velocity.y * deltaTime;
            piece.velocity.x *= 1 - (2 * deltaTime);
            piece.velocity.y *= 1 - (2 * deltaTime);
        }
        const piecesStoppedMoving = this.pieces.every((p) =>
            Math.abs(p.velocity.x) + Math.abs(p.velocity.y) < 10
        );
        if (this.player.tag === "player_has_shot" && piecesStoppedMoving) {
            this.playHitSound();
            this.swapPlayer();
            const logicGrid = this.buildLogicGrid();
        }
        if (this.player.tag === "player_aiming") {
            this.player.timer -= deltaTime;
            if (this.player.timer < 0) {
                this.playHitSound();
                this.swapPlayer();
            }
        }
        this.lastTick = now;
    }

    private playHitSound() {
        const sound = new Audio("/pop.mp3");
        sound.play();
    }

    private render() {
        this.ctx.fillStyle = "#ddd";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const gridX = (this.canvas.width - this.grid.width * this.grid.unit) /
            2;
        for (let xIdx = 0; xIdx < this.grid.width; ++xIdx) {
            for (let yIdx = 0; yIdx < this.grid.height; ++yIdx) {
                const x = xIdx * this.grid.unit + gridX;
                const y = yIdx * this.grid.unit + 24;
                const gridCenter = {
                    x: x + this.grid.unit / 2,
                    y: y + this.grid.unit / 2,
                };
                const candidates = this.pieces
                    .filter((p) => {
                        return intersectsSquare(p.pos, {
                            pos: { x, y },
                            size: { x: this.grid.unit, y: this.grid.unit },
                        });
                    })
                    .sort((lhs, rhs) =>
                        pointDist(lhs.pos, gridCenter) -
                        pointDist(rhs.pos, gridCenter)
                    );

                const winner = candidates.at(0);
                if (winner !== undefined) {
                    this.selectedSkin.render({
                        pos: { x, y },
                        size: { x: this.grid.unit, y: this.grid.unit },
                        player: winner.player,
                    }, this.ctx);
                }

                this.ctx.strokeStyle = "#444";
                this.ctx.strokeRect(
                    x,
                    y,
                    this.grid.unit,
                    this.grid.unit,
                );
            }
        }
        for (const piece of this.pieces) {
            this.renderCircle(piece, this.ctx);
        }
        if (this.player.tag === "player_aiming") {
            if (this.player.aim !== null) {
                this.ctx.save();
                this.ctx.lineWidth = 8;
                this.ctx.strokeStyle = "#444";
                this.ctx.beginPath();
                this.ctx.moveTo(this.player.pos.x, this.player.pos.y);
                const aimAt = v2add(this.player.aim, this.player.pos);
                this.ctx.lineTo(
                    aimAt.x,
                    aimAt.y,
                );
                this.ctx.stroke();
                this.ctx.restore();
            }
            this.renderCircle(this.player, this.ctx);

            this.ctx.font = "32px monospace";
            this.ctx.fillStyle = "#444";
            const textSize = this.ctx.measureText(
                this.player.timer.toFixed(2),
            );
            this.ctx.fillText(
                this.player.timer.toFixed(2),
                this.canvas.width / 2 - textSize.width / 2,
                980,
            );
        }
    }
}

function main() {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;

    const board = new StateMasterControllerLogicHandlerBusiness(canvas);

    const skinSelect = document.querySelector<HTMLSelectElement>(
        "#skin-selection",
    )!;

    skinSelect.addEventListener("input", () => {
        board.selectedSkin = skins[parseInt(skinSelect.value)];
    });
    board.selectedSkin = skins[parseInt(skinSelect.value)];
}

main();
