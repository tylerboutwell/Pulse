'use client';

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { createConnection } from "@/lib/signalr";
import { Player } from "@/types/player";
import { Game } from "@/types/game";
import { useRouter } from "next/navigation";
import { Question } from "../../types/question";

type InProgressProps = {
    game: Game;
};
export default function InProgress({ game }: InProgressProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerId, setPlayerId] = useState<number | null>(null)
    const [question, setQuestion] = useState<Question | null>(null);
    const [questionOrder, setQuestionOrder] = useState<number>(0);
    const [playerLoading, setPlayerLoading] = useState(true);
    const [questionLoading, setQuestionLoading] = useState(true);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
    const [questionEndsAt, setQuestionEndsAt] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const [isQuestionClosed, setIsQuestionClosed] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const getPlayers = async () => {
            const storedPlayerId = localStorage.getItem(`playerId-${game.id}`);
            setPlayerId(storedPlayerId ? Number(storedPlayerId) : null);
            const response = await fetch(`${API_URL}/games/${game.id}/players`);
            const data = await response.json();
            setPlayers(data);
            setPlayerLoading(false)
        };

        getPlayers();
    }, [game.id]);

    useEffect(() => {
        const getQuestion = async () => {
            const response = await fetch(
                `${API_URL}/games/${game.id}/question`
            );

            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const question = await response.json();

            setSelectedAnswer(null);
            setAnswerCorrect(null);
            setQuestion(question.question);
            setQuestionOrder(question.order);
            setTotalQuestions(question.totalQuestions);
            setQuestionEndsAt(question.questionEndsAt);
            setIsQuestionClosed(question.isQuestionClosed ?? false);
            setQuestionLoading(false);
            setCorrectAnswer(question.question.correctOption);
        };

        getQuestion();
    }, [game.id, game.currentQuestionId]);

    useEffect(() => {
        if (!questionEndsAt || isQuestionClosed) return;

        const kickoff = setTimeout(() => setNow(Date.now()), 0);
        const interval = setInterval(() => setNow(Date.now()), 250);

        return () => {
            clearTimeout(kickoff);
            clearInterval(interval);
        };
    }, [questionEndsAt, isQuestionClosed]);

    const secondsRemaining = questionEndsAt
        ? Math.max(0, Math.ceil((new Date(questionEndsAt).getTime() - now) / 1000))
        : 0;

    const timeIsUp = isQuestionClosed || (questionEndsAt !== null && secondsRemaining === 0);

    useEffect(() => {
        const connection = createConnection();
        let cancelled = false;

        connection.on("UpdateScores", (players: Player[]) => {
            setPlayers(players);
        });

        connection.on("QuestionClosed", (correctOption: string) => {
            setCorrectAnswer(correctOption);
            setIsQuestionClosed(true);
        });

        connection.on("ChangeQuestion", (question: Question, order: number, totalQuestions: number, questionEndsAt: string) => {
            setSelectedAnswer(null);
            setAnswerCorrect(null);
            setQuestion(question);
            setQuestionOrder(order);
            setTotalQuestions(totalQuestions);
            setQuestionEndsAt(questionEndsAt);
            setIsQuestionClosed(false);
            setCorrectAnswer(null)
        });

        connection.on("GameFinished", () => {
            router.refresh();
        });

        connection.onreconnected(() => {
            connection.invoke("JoinGame", game.id).catch(console.error);
        });

        const startConnection = async () => {
            try {
                await connection.start();
                if (cancelled) return;

                await connection.invoke("JoinGame", game.id);
                console.log("SignalR connected and joined game!");
            } catch (err) {
                if (cancelled) return; // expected in dev from Strict Mode
                console.error("SignalR error:", err);
            }
        };

        startConnection();

        return () => {
            cancelled = true;
            connection.stop();
        };
    }, [game.id]);

    const currentPlayer = players.find(
        player => player.id === playerId
    );

    const handleAnswer = async (answer: string) => {
        if (!currentPlayer || selectedAnswer) {
            return;
        }

        setSelectedAnswer(answer);

        const response = await fetch(`${API_URL}/games/${game.id}/answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerId: currentPlayer.id,
                answer: answer
            })
        });

        if (!response.ok) {
            console.error("Failed to submit answer");
            return;
        }

        const result: { isCorrect: boolean } = await response.json();

        setAnswerCorrect(result.isCorrect);

    }

    const getAnswerClass = (answer: string) => {
        const base = "w-full rounded-lg border p-3 text-left transition-colors disabled:cursor-default";

        // Show the correct answer when time is up, regardless of selection
        if (isQuestionClosed && answer == correctAnswer) {
            return `${base} border-green-500 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300`;
        }

        if (selectedAnswer !== answer) {
            return `${base} border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700`;
        }

        if (answerCorrect === null) {
            return `${base} border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100`;
        }

        return answerCorrect
            ? `${base} border-green-500 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300`
            : `${base} border-red-500 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300`;
    };

    if (playerLoading || questionLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-100 border-t-cyan-600 dark:border-slate-700 dark:border-t-cyan-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading game...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                {/* Category and Question Counter */}
                <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
                        {game.quizName}
                    </span>

                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        Question {questionOrder} of {totalQuestions}
                    </span>
                </div>

                {/* Question */}
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {question?.text}
                </div>

                {/* Timer */}
                <div className={`mt-4 flex items-center justify-center rounded-lg px-4 py-3 font-semibold ${isQuestionClosed
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : timeIsUp || secondsRemaining <= 5
                            ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300"
                            : "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300"
                    }`}>
                    {isQuestionClosed ? (
                        <span>Answers revealed!</span>
                    ) : !questionEndsAt ? (
                        <span className="text-slate-400 dark:text-slate-500">
                            Loading timer...
                        </span>
                    ) : secondsRemaining === 0 ? (
                        <span>Time is up!</span>
                    ) : (
                        <span className="tabular-nums">
                            {secondsRemaining}s remaining
                        </span>
                    )}
                </div>

                {/* Options */}
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        disabled={selectedAnswer !== null || timeIsUp}
                        className={getAnswerClass("A")}
                        onClick={() => handleAnswer("A")}
                    >
                        {question?.optionA}
                    </button>

                    <button disabled={selectedAnswer !== null || timeIsUp }
                        className={getAnswerClass("B")}
                        onClick={() => handleAnswer("B")}
                    >
                        {question?.optionB}
                    </button>

                    <button disabled={selectedAnswer !== null || timeIsUp}
                        className={getAnswerClass("C")}
                        onClick={() => handleAnswer("C")}
                    >
                        {question?.optionC}
                    </button>

                    <button disabled={selectedAnswer !== null || timeIsUp}
                        className={getAnswerClass("D")}
                        onClick={() => handleAnswer("D")}
                    >
                        {question?.optionD}
                    </button>

                    {/* Answer Feedback */}
                    {answerCorrect !== null && (
                        <div
                            className={`mt-3 rounded-lg border p-3 ${answerCorrect
                                    ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                                    : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                                }`}
                        >
                            <p className="font-semibold">
                                {answerCorrect ? "Correct! 🎉" : "Wrong!"}
                            </p>

                            <p className="mt-1 text-sm">
                                {answerCorrect
                                    ? "+1 point"
                                    : "Better luck on the next question."}
                            </p>
                        </div>
                    )}
                </div>


                {/* Scoreboard */}
                <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900 dark:text-white">Scoreboard</h2>
                        <span className="text-xs text-slate-500 dark:text-slate-400">LIVE</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        {[...players]
                            .sort((a, b) => b.score - a.score)
                            .map((player, index) => (
                                <div
                                    key={player.id}
                                    className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${player.id === playerId
                                            ? "bg-cyan-50/90 dark:bg-cyan-950/60"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                        }`}
                                >
                                    <span className="w-5 text-center text-sm text-slate-400">
                                        {index + 1}
                                    </span>

                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${player.id === playerId
                                            ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
                                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                        }`}>
                                        {player.name.trim().charAt(0).toUpperCase() || "?"}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                            {player.name}
                                        </span>
                                        {player.id === playerId && (
                                            <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
                                                You
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                                        {player.score}
                                        <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
                                            pts
                                        </span>
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>

            </div>
        </div>
    );
}