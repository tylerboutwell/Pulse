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
            <div className="border rounded-lg p-8 w-80 shadow-sm">
                Question {questionOrder} of {totalQuestions}
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
                    <div className="font-bold mb-2">
                        Scoreboard
                    </div>

                    <div className="flex flex-col gap-2">
                        {players
                            .sort((a, b) => b.score - a.score)
                            .map((player, index) => (
                                <div
                                    key={player.id}
                                    className="flex justify-between border rounded-lg p-2"
                                >
                                    <span>
                                        {index + 1}. {player.name}
                                    </span>

                                    <span className="font-bold">
                                        {player.score}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>

            </div>
        </div>
    );
}