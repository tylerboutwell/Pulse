'use client';

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import { createConnection } from "@/lib/signalr";
import { Player } from "@/types/player";
import { Game } from "@/types/game";
import { useRouter } from "next/navigation";

type WaitingProps = {
    game: Game;
};
export default function Waiting({ game }: WaitingProps) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(true);
    const [playerId, setPlayerId] = useState<number | null>(null)
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copyError, setCopyError] = useState(false);

    useEffect(() => {
        const getPlayers = async () => {
            const storedPlayerId = localStorage.getItem(`playerId-${game.id}`);
            setPlayerId(storedPlayerId ? Number(storedPlayerId) : null);
        };

        getPlayers();
    }, [game.id]);

    useEffect(() => {
        const connection = createConnection();
        let cancelled = false;

        const loadPlayers = async () => {
            const res = await fetch(`${API_URL}/games/${game.id}/players`);
            if (!res.ok || cancelled) return;
            setPlayers(await res.json());
            setLoadingPlayers(false);
        };

        const joinAndSync = async () => {
            await connection.invoke("JoinGame", game.id);
            if (cancelled) return;
            await loadPlayers();
        };

        connection.on("PlayerJoined", (player: Player) => {
            setPlayers(prev =>
                prev.some(p => p.id === player.id) ? prev : [...prev, player]
            );
        });

        connection.on("GameStarted", () => {
            router.refresh();
        });

        connection.onreconnected(() => {
            connection.invoke("JoinGame", game.id).catch(console.error);
        });

        const startConnection = async () => {
            try {
                await connection.start();
                if (cancelled) return;

                await joinAndSync();
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
    }, [game.id, router]);

    const currentPlayer = players.find(
        player => player.id === playerId
    );

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(game.gameCode);
            setCopiedCode(true);
            setCopyError(false);

            window.setTimeout(() => setCopiedCode(false), 2000);
        } catch {
            setCopyError(true);
        }
    };

    const handleStart = async () => {
        setError(null);
        try {
            const response = await fetch(`${API_URL}/games/${game.id}/start`, {
                method: "POST",
            });
            if (!response.ok) {
                setError("Couldn't start the game. Try again.");
                return;
            }
            router.refresh();
        } catch {
            setError("Network error. Try again.");
        }
    };
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="border rounded-lg p-8 w-80 shadow-sm">

            <div className="text-2xl font-bold">
                Waiting for players
            </div>

            <div className="mt-4">
                <p className="text-xs font-medium tracking-wider text-gray-400">
                    GAME CODE
                </p>

                <div className="mt-1 flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900">
                        {game.gameCode}
                    </span>

                    <button
                        onClick={handleCopyCode}
                        className="text-sm font-medium text-gray-500 transition hover:text-black"
                    >
                        {copiedCode ? "✓ Copied" : "Copy"}
                    </button>
                </div>
            </div>

            <div className="mt-4 text-lg">
                Players ({players.length})
            </div>

            {loadingPlayers ? (
                <div className="flex flex-col items-center py-6">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                    <p className="mt-3 text-sm text-gray-500">
                        Loading players...
                    </p>
                </div>
            ) : players.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">
                    No players yet. Share the game code!
                </p>
            ) : (
                <ul className="mt-3 space-y-2 text-gray-700">
                    {players.map(player => (
                        <li
                            key={player.id}
                            className="rounded-lg border bg-gray-50 px-3 py-2 text-center"
                        >
                            {player.name}
                            {player.id === playerId && (
                                <span className="ml-2 text-xs text-gray-500">
                                    (You)
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
                )}
                {currentPlayer?.isHost && (
                    <>
                        <button onClick={handleStart} className="mt-4 px-4 py-2 rounded bg-black text-white">
                            Start Game
                        </button>
                        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                    </>
                )}
            </div>
        </div>
    )
}