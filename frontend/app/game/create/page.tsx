'use client';
import { API_URL } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quiz } from "@/types/quiz";

export default function Home() {
    const [playerName, setPlayerName] = useState("");
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [quizId, setQuizId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const getQuizzes = async () => {
            const response = await fetch(`${API_URL}/quizzes`);
            if (!response.ok) {
                console.error(`Response status: ${response.status}`);
                return;
            }
            const data = await response.json();
            setQuizzes(data);
        };

        getQuizzes();
    }, []);

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
                            {quizzes.map((quiz) => (
                                <div
                                    key={quiz.id}
                                    onClick={() => setQuizId(quiz.id)}
                                    role="button"
                                    className={`text-slate-800 flex w-full items-center rounded-md p-3 transition-all
                                        ${quizId === quiz.id ? "bg-slate-200" : "hover:bg-slate-100"}`}
                                >
                                    {quiz.title}
                                </div>
                            ))}
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