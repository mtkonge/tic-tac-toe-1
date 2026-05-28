import { PlayerSquare } from "./player.ts";

interface Skin {
    render: (bounds: PlayerSquare, ctx: CanvasRenderingContext2D) => void;
}

class RedBlueSkin implements Skin {
    render(square: PlayerSquare, ctx: CanvasRenderingContext2D) {
        switch (square.player) {
            case 0:
                ctx.fillStyle = "red";
                break;
            case 1:
                ctx.fillStyle = "blue";
                break;
        }
        ctx.fillRect(
            square.pos.x,
            square.pos.y,
            square.size.x,
            square.size.y,
        );
    }
}

export function availableSkins(): Skin[] {
    return [
        new RedBlueSkin(),
    ];
}
