'use client';

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { Player } from "@/types/player";
import { Game } from "@/types/game";

type CompleteProps = {
    game: Game;
};

export default function Complete({ game }: CompleteProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerId, setPlayerId] = useState<number | null>(null);

    useEffect(() => {
        const getPlayers = async () => {
            const storedPlayerId = localStorage.getItem(`playerId-${game.id}`);
            setPlayerId(storedPlayerId ? Number(storedPlayerId) : null);

            const response = await fetch(`${API_URL}/games/${game.id}/players`);
            if (!response.ok) {
                console.error(`Response status: ${response.status}`);
                return;
            }

            const data = await response.json();
            setPlayers(data);
        };

        getPlayers();
    }, [game.id]);

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

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
            </div>
        </div>
    );
}