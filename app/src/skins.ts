import { PlayerSquare } from "./player.ts";

interface Skin {
    render: (bounds: PlayerSquare, ctx: CanvasRenderingContext2D) => void;
}

class RedBlueSkin implements Skin {
    render(square: PlayerSquare, ctx: CanvasRenderingContext2D) {
        let text;
        switch (square.player) {
            case 0:
                ctx.fillStyle = "#E87461";
                text = "X";
                break;
            case 1:
                text = "O";
                ctx.fillStyle = "#6883BA";
                break;
        }
        ctx.fillRect(
            square.pos.x,
            square.pos.y,
            square.size.x,
            square.size.y,
        );

        ctx.font = "32px monospace";
        ctx.fillStyle = "#fff";
        const textSize = ctx.measureText(
            text,
        );
        ctx.fillText(
            text,
            square.pos.x + square.size.x / 2 - textSize.width / 2,
            square.pos.y + square.size.y / 2 + textSize.emHeightAscent / 2,
        );
    }
}

class Tuborg implements Skin {
    render(square: PlayerSquare, ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#7c7";
        const image = new Image();
        switch (square.player) {
            case 0:
                image.src = "/groen.jpg";
                break;
            case 1:
                image.src = "/classic.jpg";
                break;
        }
        ctx.fillRect(
            square.pos.x,
            square.pos.y,
            square.size.x,
            square.size.y,
        );
        ctx.drawImage(
            image,
            0,
            0,
            image.width,
            image.height,
            square.pos.x,
            square.pos.y,
            square.size.x,
            square.size.y,
        );
    }
}

class Teacher implements Skin {
    render(square: PlayerSquare, ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#7c7";
        const image = new Image();
        switch (square.player) {
            case 0:
                image.src = "/mags.jpg";
                break;
            case 1:
                image.src = "/kasc.jpg";
                break;
        }
        ctx.fillRect(
            square.pos.x,
            square.pos.y,
            square.size.x,
            square.size.y,
        );
        ctx.drawImage(
            image,
            0,
            0,
            image.width,
            image.height,
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
        new Tuborg(),
        new Teacher(),
    ];
}
