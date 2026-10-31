export type Game = {
    id: number;
    quizId: number;
    quizName: string;
    gameCode: string;
    status: string;
    currentQuestionId: number | null;
};