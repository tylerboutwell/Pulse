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
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const getPlayers = async () => {
            const storedPlayerId = localStorage.getItem(`playerId-${game.id}`);
            setPlayerId(storedPlayerId ? Number(storedPlayerId) : null);
            const response = await fetch(`${API_URL}/games/${game.id}/players`);
            const data = await response.json();
            setPlayers(data);
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

            setQuestion(question.question);
            setQuestionOrder(question.order);
            setTotalQuestions(question.totalQuestions);
        };

        getQuestion();
    }, [game.id, game.currentQuestionId]);

    useEffect(() => {
        const connection = createConnection();
        let cancelled = false;

        connection.on("UpdateScores", (players: Player[]) => {
            setPlayers(players);
        });

        connection.on("ChangeQuestion", (question: Question, order: number, totalQuestions: number) => {
            setSelectedAnswer(null)
            setQuestion(question);
            setQuestionOrder(order);
            setTotalQuestions(totalQuestions);
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

        const result = await fetch(`${API_URL}/games/${game.id}/answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerId: currentPlayer.id,
                answer: answer
            })
        });

        if (!result.ok) {
            console.error("Failed to submit answer");
            return;
        }

    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-sm">
                {/* Category and Question Counter */}
                <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        {game.quizName}
                    </span>

                    <span className="text-sm text-slate-500">
                        Question {questionOrder} of {totalQuestions}
                    </span>
                </div>

                {/* Question */}
                <div className="text-2xl font-bold">
                    {question?.text}
                </div>

                {/* Options */}
                <div className="mt-4 flex flex-col gap-2">
                    <button
                        disabled={selectedAnswer !== null}
                        className={`border rounded-lg p-3 ${selectedAnswer === "A" ? "bg-gray-200" : ""
                            }`}
                        onClick={() => handleAnswer("A")}
                    >
                        {question?.optionA}
                    </button>

                    <button disabled={selectedAnswer !== null}
                        className={`border rounded-lg p-3 ${selectedAnswer === "B" ? "bg-gray-200" : ""
                            }`}
                        onClick={() => handleAnswer("B")}
                    >
                        {question?.optionB}
                    </button>

                    <button disabled={selectedAnswer !== null}
                        className={`border rounded-lg p-3 ${selectedAnswer === "C" ? "bg-gray-200" : ""
                            }`}
                        onClick={() => handleAnswer("C")}
                    >
                        {question?.optionC}
                    </button>

                    <button disabled={selectedAnswer !== null}
                        className={`border rounded-lg p-3 ${selectedAnswer === "D" ? "bg-gray-200" : ""
                            }`}
                        onClick={() => handleAnswer("D")}
                    >
                        {question?.optionD}
                    </button>
                </div>


                {/* Scoreboard */}
                <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold text-slate-900">Scoreboard</h2>
                        <span className="text-xs text-slate-500">LIVE</span>
                    </div>

                    <div className="flex flex-col gap-1">
                        {[...players]
                            .sort((a, b) => b.score - a.score)
                            .map((player, index) => (
                                <div
                                    key={player.id}
                                    className={`flex items-center gap-3 rounded-xl px-2 py-2 transition-colors ${player.id === playerId
                                            ? "bg-cyan-50/90"
                                            : "hover:bg-slate-50"
                                        }`}
                                >
                                    <span className="w-5 text-center text-sm text-slate-400">
                                        {index + 1}
                                    </span>

                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${player.id === playerId
                                            ? "bg-cyan-100 text-cyan-800"
                                            : "bg-slate-100 text-slate-600"
                                        }`}>
                                        {player.name.trim().charAt(0).toUpperCase() || "?"}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <span className="truncate text-sm font-medium text-slate-800">
                                            {player.name}
                                        </span>
                                        {player.id === playerId && (
                                            <span className="ml-1.5 text-xs text-slate-400">
                                                You
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-sm font-semibold tabular-nums text-slate-900">
                                        {player.score}
                                        <span className="ml-1 text-xs font-normal text-slate-400">
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