'use client';
import Link from "next/link";
import { API_URL } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const [playerName, setPlayerName] = useState("");
    const [quizId, setQuizId] = useState<number | null>(null);
    const router = useRouter();

    const handleCreate = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (quizId == null || !playerName.trim()) return

        const response = await fetch(`${API_URL}/games/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quizId,
                playerName
            })
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        localStorage.setItem(`playerId-${result.game.id}`, result.playerId.toString());
        router.push(`/game/${result.game.id}`);
    }

    return (
        <main className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-5">
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-3"
                />
                <h1 className="text-4xl font-bold">Choose quiz</h1>

                <form onSubmit={handleCreate}>
                    <div className="relative flex flex-col rounded-lg bg-white shadow-sm border border-slate-200">
                        <nav className="flex min-w-[240px] flex-col gap-1 p-1.5">
                            <div
                                onClick={() => setQuizId(1)}
                                role="button"
                                className={`text-slate-800 flex w-full items-center rounded-md p-3 transition-all
                                        ${quizId === 1 ? "bg-slate-200" : "hover:bg-slate-100"}`}
                            >
                                Sports
                            </div>
                            <div
                                onClick={() => setQuizId(2)}
                                role="button"
                                className={`text-slate-800 flex w-full items-center rounded-md p-3 transition-all
                                        ${quizId === 2 ? "bg-slate-200" : "hover:bg-slate-100"}`}
                            >
                                Movies
                            </div>
                            <div
                                onClick={() => setQuizId(3)}
                                role="button"
                                className={`text-slate-800 flex w-full items-center rounded-md p-3 transition-all
                                        ${quizId === 3 ? "bg-slate-200" : "hover:bg-slate-100"}`}
                            >
                                Music
                            </div>
                        </nav>
                    </div>

                
                    <button type="submit" className="m-3 px-6 py-3 rounded-lg bg-black text-white hover:bg-stone-700">
                        Create Game
                    </button>
                </form>
           
            </div>
        </main>
    );
}