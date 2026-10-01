export interface User {
    id: string;
    username: string;
    points: number;
    level: number;
    completedQuests: string[];
    friends: string[];
}