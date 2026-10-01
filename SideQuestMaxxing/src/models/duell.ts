export interface Duel {
    id: string;
    questId: string;
    player1Id: string;
    player2Id: string;
    status: string;
    winnerId?: string;
    createdAt: string;
}