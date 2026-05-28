export type V2 = { x: number; y: number };

export type Circle = { pos: V2; radius: number };

export type Square = { pos: V2; size: V2 };

export function pointDist(lhs: V2, rhs: V2): number {
    return Math.sqrt(
        (lhs.x - rhs.x) ** 2 + (lhs.y - rhs.y) ** 2,
    );
}

export function pointUnit(v: V2): V2 {
    const len = pointLength(v);
    return { x: v.x / len, y: v.y / len };
}

export function pointLength(v: V2): number {
    return Math.sqrt(
        (v.x) ** 2 + (v.y) ** 2,
    );
}

export function intersectsPoint(point: V2, circle: Circle): boolean {
    return pointDist(point, circle.pos) <= circle.radius;
}

export function intersectsSquare(
    point: V2,
    square: Square,
): boolean {
    if (point.x < square.pos.x || point.x > square.pos.x + square.size.x) {
        return false;
    }
    if (point.y < square.pos.y || point.y > square.pos.y + square.size.y) {
        return false;
    }
    return true;
}

export function intersectsCircle(a: Circle, b: Circle): boolean {
    return pointDist(a.pos, b.pos) <= a.radius + b.radius;
}
