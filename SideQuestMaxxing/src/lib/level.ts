export const MAX_LEVEL = 50;
const BASE_XP = 10;
const GROWTH = 1.12; // muss mit level_for_points in SQL übereinstimmen

export function xpForLevelUp(level: number) {
    return Math.round(BASE_XP * Math.pow(GROWTH, level - 1));
}

export function getLevelInfo(points: number) {
    let level = 1;
    let need = 0;

    while (level < MAX_LEVEL) {
        const cost = xpForLevelUp(level);

        if (points < need + cost) {
            return { level, xpInLevel: points - need, xpForNext: cost, isMax: false };
        }

        need += cost;
        level++;
    }

    return { level: MAX_LEVEL, xpInLevel: 0, xpForNext: 0, isMax: true };
}