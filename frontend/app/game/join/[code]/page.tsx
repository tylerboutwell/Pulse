'use client';
import { useState } from "react";
import { API_URL } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";

export default function Page() {

    const { code } = useParams<{ code: string }>();
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
                    gameCode: code,
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
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
            <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Join Game
                </h1>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Game code
                </p>

                <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-lg text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {code}
                </div>

                <form onSubmit={handleJoin} className="mt-5 space-y-4">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={30}
                        required
                        disabled={isJoining}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-900"
                    />

                    {error && (
                        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isJoining || !playerName.trim()}
                        className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 font-medium text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:hover:bg-cyan-400"
                    >
                        {isJoining ? "Joining..." : "Join Game"}
                    </button>
                </form>
            </div>
        </main>
    );
}