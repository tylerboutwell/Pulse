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
        <main className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-6">
                <h1 className="text-5xl font-bold">Join Game</h1>

                <form onSubmit={handleJoin} >
                    <input type='text'
                        placeholder="Enter your name" value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className='bg-neutral-secondary-medium border rounded-lg m-1 p-2' />
                    <input
                        type="text"
                        value={code}
                        readOnly
                        className="bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-lg m-1 p-2 focus:outline-none cursor-default"
                    />

                    <button type='submit' className='p-2 bg-blue-500 hover:bg-blue-400 border rounded-lg'>Submit</button>
                </form>
                {error && (
                    <p role="alert" className="text-red-500">
                        {error}
                    </p>
                )}
            </div>
        </main>
    );
}