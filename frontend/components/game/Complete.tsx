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
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="border rounded-lg p-8 w-80 shadow-sm">
                <h1 className="text-2xl font-bold text-center">Game Finished!</h1>

                {/* Winner */}
                {winner && (
                    <div className="mt-6 text-center">
                        <div className="text-sm font-medium text-gray-500">🏆 Winner</div>
                        <div className="mt-1 text-xl font-bold">
                            {winner.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {winner.score} {winner.score === 1 ? "point" : "points"}
                        </div>
                    </div>
                )}

                {/* Final Scoreboard */}
                <div className="mt-6">
                    <div className="font-bold mb-2">Final Scores</div>

                    <div className="flex flex-col gap-2">
                        {sortedPlayers.map((player, index) => (
                            <div
                                key={player.id}
                                className={`flex justify-between border rounded-lg p-2 ${player.id === playerId ? "bg-gray-200" : ""
                                    }`}
                            >
                                <span>
                                    {index + 1}. {player.name}
                                    {player.id === playerId && " (you)"}
                                </span>

                                <span className="font-bold">{player.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}