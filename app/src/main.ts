type Player = "x" | "o";

type V2 = { x: number; y: number };

type Circle = { pos: V2; radius: number };

type Cell = {
    player: Player | null;
};

function intersectsPoint(point: V2, circle: Circle): boolean {
    const dist = Math.sqrt(
        (point.x - circle.pos.x) ** 2 + (point.y - circle.pos.y) ** 2,
    );
    return dist <= circle.radius;
}

function intersectsCircle(a: Circle, b: Circle): boolean {
    const dist = Math.sqrt(
        (a.pos.x - b.pos.x) ** 2 + (a.pos.y - b.pos.y) ** 2,
    );
    return dist <= a.radius + b.radius;
}

function renderCircle(circle: Circle, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(circle.pos.x, circle.pos.y, circle.radius, 0, Math.PI * 2);
    ctx.fill();
}

function v2sub(lhs: V2, rhs: V2) {
    return { x: lhs.x - rhs.x, y: lhs.y - rhs.y };
}

function v2add(lhs: V2, rhs: V2) {
    return { x: lhs.x + rhs.x, y: lhs.y + rhs.y };
}

class StateMasterControllerLogicHandlerBusiness {
    private ctx: CanvasRenderingContext2D;
    private player: Circle;
    private velocity = { x: 0, y: 0 };
    private shot = false;
    private shootDelta: V2 | null = null;

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

    private basePlayer() {
        return { pos: { x: this.canvas.width / 2, y: 800 }, radius: 25 };
    }

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d")!;
        this.player = this.basePlayer();

        document.addEventListener("mouseup", () => this.shoot());
        document.addEventListener("mousedown", (ev) => {
            const delta = v2sub(this.mousePos(ev), this.player.pos);
            this.shootDelta = { x: -delta.x, y: -delta.y };
        });

        document.addEventListener("mousemove", (ev) => {
            if (!this.shootDelta) return;
            const delta = v2sub(this.mousePos(ev), this.player.pos);
            this.shootDelta = { x: -delta.x, y: -delta.y };
        });

        setInterval(() => {
            this.update();
            this.render();
        });
    }

    private shoot() {
        if (!this.shootDelta) return;
        const velocityModifier = 1.5;

        const calc = (x: number) =>
            (Math.abs(x) ** velocityModifier) * Math.sign(x);

        this.velocity = {
            x: calc(this.shootDelta.x),
            y: calc(this.shootDelta.y),
        };
        this.shot = true;
        this.shootDelta = null;
    }

    private lastTick = Temporal.Now.instant();
    private update() {
        const now = Temporal.Now.instant();
        const deltaT = now.since(this.lastTick).milliseconds / 1000;
        this.player.pos.x += this.velocity.x * deltaT;
        this.player.pos.y += this.velocity.y * deltaT;
        this.velocity.x *= 0.99;
        this.velocity.y *= 0.99;
        this.lastTick = now;
    }

    private render() {
        this.ctx.fillStyle = "#ddd";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.shootDelta !== null) {
            this.ctx.strokeStyle = "red";
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.pos.x, this.player.pos.y);
            this.ctx.lineTo(
                v2add(this.shootDelta, this.player.pos).x,
                v2add(this.shootDelta, this.player.pos).y,
            );
            this.ctx.stroke();
        }
        this.ctx.fillStyle = "#000";

        renderCircle(this.player, this.ctx);
    }
}

function main() {
    const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
    const board: Cell[] = new Array(9).fill(0).map(() => ({ player: null }));

    new StateMasterControllerLogicHandlerBusiness(canvas);
}

main();
