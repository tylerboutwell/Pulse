'use client';
import { useState } from "react";
import { API_URL } from "../../../lib/api";
import { useRouter } from "next/navigation";

export default function Page() {
    const [gameCode, setGameCode] = useState('')
    const [playerName, setPlayerName] = useState('')
    const [error, setError] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsJoining(true);

        try {
            const response = await fetch(`${API_URL}/games/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gameCode,
                    playerName
                })
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Game not found. Check the game code and try again.");
                }

                throw new Error("Couldn't join the game. Please try again.");
            }

            const result = await response.json();
            localStorage.setItem(
                `playerId-${result.gameId}`,
                result.id.toString()
            );

            router.push(`/game/${result.gameId}`);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">
                    Join Game
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Enter your name and game code to join.
                </p>

                <form onSubmit={handleJoin} className="mt-5 space-y-4">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={30}
                        required
                        disabled={isJoining}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />

                    <input
                        type="text"
                        placeholder="Enter game code"
                        value={gameCode}
                        onChange={(e) => setGameCode(e.target.value)}
                        required
                        disabled={isJoining}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                    />

                    {error && (
                        <p role="alert" className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isJoining || !playerName.trim() || !gameCode.trim()}
                        className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isJoining ? "Joining..." : "Join Game"}
                    </button>
                </form>
            </div>
        </main>
    );
}