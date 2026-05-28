type V2 = { x: number; y: number };

type Circle = { pos: V2; radius: number; skin: string };
type Piece = Circle & { velocity: V2 };

function pointDist(lhs: V2, rhs: V2): number {
    return Math.sqrt(
        (lhs.x - rhs.x) ** 2 + (lhs.y - rhs.y) ** 2,
    );
}

function intersectsPoint(point: V2, circle: Circle): boolean {
    return pointDist(point, circle.pos) <= circle.radius;
}

function intersectsSquare(point: V2, square: { pos: V2; size: V2 }): boolean {
    if (point.x < square.pos.x || point.x > square.pos.x + square.size.x) {
        return false;
    }
    if (point.y < square.pos.y || point.y > square.pos.y + square.size.y) {
        return false;
    }
    return true;
}

function intersectsCircle(a: Circle, b: Circle): boolean {
    return pointDist(a.pos, b.pos) <= a.radius + b.radius;
}

function renderCircle(circle: Circle, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(circle.pos.x, circle.pos.y, circle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#444";
    ctx.beginPath();
    ctx.arc(circle.pos.x, circle.pos.y, circle.radius, 0, Math.PI * 2);
    ctx.stroke();
}

function v2sub(lhs: V2, rhs: V2) {
    return { x: lhs.x - rhs.x, y: lhs.y - rhs.y };
}

function v2add(lhs: V2, rhs: V2) {
    return { x: lhs.x + rhs.x, y: lhs.y + rhs.y };
}

type Player = Circle & { aim: V2 | null };

type Grid = {
    width: number;
    height: number;
    unit: number;
};

class StateMasterControllerLogicHandlerBusiness {
    private ctx: CanvasRenderingContext2D;
    private grid: Grid = { unit: 80, width: 5, height: 5 };
    private player: Player | null;
    private pieces: Piece[] = [];

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

    private basePlayer(): Player {
        return {
            pos: { x: this.canvas.width / 2, y: 850 },
            radius: 25,
            aim: null,
            skin: "#77c",
        } satisfies Player;
    }

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d")!;
        this.player = this.basePlayer();

        document.addEventListener("mouseup", (ev) => {
            if (ev.button !== 0) return;
            this.shoot();
        });
        document.addEventListener("mousedown", (ev) => {
            if (ev.button !== 0) return;
            if (this.player === null) return;
            if (!intersectsPoint(this.mousePos(ev), this.player)) return;
            const delta = v2sub(this.mousePos(ev), this.player.pos);
            this.player.aim = { x: -delta.x, y: -delta.y };
        });

        document.addEventListener("mousemove", (ev) => {
            if (ev.button !== 0) return;
            if (this.player === null || this.player.aim === null) return;
            const delta = v2sub(this.mousePos(ev), this.player.pos);
            this.player.aim = { x: -delta.x, y: -delta.y };
        });

        setInterval(() => {
            this.update();
            this.render();
        });

        const renderCb = () => {
            this.render();
            requestAnimationFrame(renderCb);
        };
        requestAnimationFrame(renderCb);
    }

    private shoot() {
        if (this.player === null || this.player.aim === null) return;
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
            skin: this.player.skin,
        } satisfies Piece;
        this.pieces.push(piece);
        this.player = null;
    }

    private lastTick = Temporal.Now.instant();
    private update() {
        const now = Temporal.Now.instant();
        const deltaT = now.since(this.lastTick).milliseconds / 1000;

        for (let i = 0; i < this.pieces.length; ++i) {
            for (let j = i + 1; j < this.pieces.length; ++j) {
                const piece0 = this.pieces[i];
                const piece1 = this.pieces[j];
                if (piece0 === piece1) throw new Error("unreachable");
                if (!intersectsCircle(piece0, piece1)) continue;
                console.log("intersection");

                const p0v = piece0.velocity;
                const p1v = piece1.velocity;
                piece0.velocity = p1v;
                piece1.velocity = p0v;
            }
        }
        for (const piece of this.pieces) {
            piece.pos.x += piece.velocity.x * deltaT;
            piece.pos.y += piece.velocity.y * deltaT;
            piece.velocity.x *= 1 - (2 * deltaT);
            piece.velocity.y *= 1 - (2 * deltaT);
        }
        const piecesStoppedMoving = this.pieces.every((p) =>
            Math.abs(p.velocity.x) + Math.abs(p.velocity.y) < 10
        );
        if (this.player === null && piecesStoppedMoving) {
            for (const piece of this.pieces) {
                piece.velocity = { x: 0, y: 0 };
            }
            this.player = this.basePlayer();
        }
        this.lastTick = now;
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
                    this.ctx.fillStyle = winner.skin;
                    this.ctx.fillRect(
                        x,
                        y,
                        this.grid.unit,
                        this.grid.unit,
                    );
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
            this.ctx.fillStyle = piece.skin;
            renderCircle(piece, this.ctx);
        }
        if (this.player !== null) {
            if (this.player.aim !== null) {
                this.ctx.strokeStyle = "red";
                this.ctx.beginPath();
                this.ctx.moveTo(this.player.pos.x, this.player.pos.y);
                const aimAt = v2add(this.player.aim, this.player.pos);
                this.ctx.lineTo(
                    aimAt.x,
                    aimAt.y,
                );
                this.ctx.stroke();
            }
            this.ctx.fillStyle = this.player.skin;
            renderCircle(this.player, this.ctx);
        }
    }
}

function main() {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;

    new StateMasterControllerLogicHandlerBusiness(canvas);
}

main();
