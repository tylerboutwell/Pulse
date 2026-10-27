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
            <div className="border rounded-xl p-6 sm:p-8 w-full max-w-sm shadow-sm">
                <h1 className="text-2xl font-bold text-center">Game Finished!</h1>

                {/* Winner */}
                {winner && (
                    <div className="mt-6 text-center">
                        <div className="text-2xl">🏆</div>
                        <div className="text-sm text-gray-500 mt-1">Winner</div>
                        <div className="text-xl font-bold mt-1">
                            {winner.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {winner.score} {winner.score === 1 ? "point" : "points"}
                        </div>
                    </div>
                )}

                {/* Final Scoreboard */}
                <div className="mt-8">
                    <h2 className="font-semibold mb-3">Final Scores</h2>

                    <div className="flex flex-col gap-2">
                        {sortedPlayers.map((player, index) => (
                            <div
                                key={player.id}
                                className={`flex items-center justify-between border rounded-lg p-3 ${player.id === playerId ? "bg-gray-100" : ""
                                    }`}
                            >
                                <span className="text-sm">
                                    <span className="text-gray-500 mr-2">
                                        {index + 1}.
                                    </span>
                                    {player.name}
                                    {player.id === playerId && (
                                        <span className="text-gray-500"> (you)</span>
                                    )}
                                </span>

                                <span className="font-semibold tabular-nums">
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