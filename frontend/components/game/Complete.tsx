'use client';

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Player } from "@/types/player";
import { Game } from "@/types/game";
import { Quiz } from "@/types/quiz";
import { createConnection } from "@/lib/signalr";

type CompleteProps = {
    game: Game;
};

export default function Complete({ game }: CompleteProps) {
    const router = useRouter();

    const [players, setPlayers] = useState<Player[]>([]);
    const [playerId, setPlayerId] = useState<number | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState(game.quizId);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const getData = async () => {
            try {
                const storedPlayerId = localStorage.getItem(`playerId-${game.id}`);
                setPlayerId(storedPlayerId ? Number(storedPlayerId) : null);

                const [playerResponse, quizzesResponse] = await Promise.all([
                    fetch(`${API_URL}/games/${game.id}/players`),
                    fetch(`${API_URL}/quizzes`)
                ]);

                if (!playerResponse.ok) {
                    throw new Error(`Players request failed: ${playerResponse.status}`);
                }

                if (!quizzesResponse.ok) {
                    throw new Error(`Quizzes request failed: ${quizzesResponse.status}`);
                }

                const playersData = await playerResponse.json();
                const quizzesData = await quizzesResponse.json();

                setPlayers(playersData);
                setQuizzes(quizzesData);

            } catch (err) {
                console.error("Error loading completion data:", err);
            }
        };

        getData();
    }, [game.id]);

    useEffect(() => {
        const connection = createConnection();
        let cancelled = false;
        let connectionStarted = false;

        const handlePlayAgain = (
            newGameId: number,
            playerIdMap: Record<string, number>
        ) => {
            const oldPlayerId = localStorage.getItem(`playerId-${game.id}`);

            if (!oldPlayerId) return;

            const newPlayerId = playerIdMap[oldPlayerId];

            if (!newPlayerId) return;

            localStorage.setItem(
                `playerId-${newGameId}`,
                newPlayerId.toString()
            );

            router.push(`/game/${newGameId}`);
        };

        const startConnection = async () => {
            try {
                connection.on("PlayAgain", handlePlayAgain);

                await connection.start();

                connectionStarted = true;

                if (cancelled) {
                    await connection.stop();
                    return;
                }

                await connection.invoke("JoinGame", game.id);

            } catch (err) {
                if (!cancelled) {
                    console.error("SignalR connection error:", err);
                }
            }
        };

        startConnection();

        return () => {
            cancelled = true;
            connection.off("PlayAgain", handlePlayAgain);

            // Only stop if negotiation has completed.
            if (connectionStarted) {
                connection.stop();
            }
        };
    }, [game.id, router]);

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    const currentPlayer = players.find(player => player.id === playerId);
    const isHost = currentPlayer?.isHost === true;

    const handlePlayAgain = async () => {
        setIsCreating(true);
        setError('');

        try {
            const response = await fetch(
                `${API_URL}/games/${game.id}/play-again`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        quizId: selectedQuizId
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to create a new game.');
            }

            // SignalR handles navigation for all players, including the host.

        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
            setIsCreating(false);
        }
    };
    

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h1 className="text-center text-2xl font-bold text-slate-900">
                    Game Finished!
                </h1>

                {/* Winner */}
                {winner && (
                    <div className="mt-6 text-center">
                        <div className="text-3xl">🏆</div>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                            Winner
                        </p>
                        <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-xl font-bold text-cyan-800">
                            {winner.name.trim().charAt(0).toUpperCase() || "?"}
                        </div>
                        <h2 className="mt-2 text-xl font-bold text-slate-900">
                            {winner.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {winner.score} {winner.score === 1 ? "point" : "points"}
                        </p>
                    </div>
                )}

                {/* Final Scoreboard */}
                <div className="mt-8">
                    <h2 className="mb-3 font-semibold text-slate-900">
                        Final Scores
                    </h2>

                    <div className="flex flex-col gap-1">
                        {sortedPlayers.map((player, index) => (
                            <div
                                key={player.id}
                                className={`flex items-center gap-3 rounded-xl px-2 py-2 ${player.id === playerId
                                        ? "bg-cyan-50/70"
                                        : ""
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
                                    <span className="text-sm font-medium text-slate-800">
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

                {/* Play Again - Host Only */}
                {isHost && (
                    <div className="mt-8 border-t border-slate-100 pt-6">
                        <h2 className="font-semibold text-slate-900">
                            Play Again?
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Start another game with the same players.
                        </p>

                        <div className="mt-4">
                            <label
                                htmlFor="quiz"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Quiz Category
                            </label>

                            <select
                                id="quiz"
                                value={selectedQuizId}
                                onChange={(e) => setSelectedQuizId(Number(e.target.value))}
                                disabled={isCreating}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                            >
                                {quizzes.map((quiz) => (
                                    <option key={quiz.id} value={quiz.id}>
                                        {quiz.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <p className="mt-3 text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handlePlayAgain}
                            disabled={isCreating || quizzes.length === 0}
                            className="mt-4 w-full rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isCreating ? 'Creating Game...' : 'Play Again'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}