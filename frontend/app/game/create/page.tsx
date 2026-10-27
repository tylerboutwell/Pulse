'use client';
import { API_URL } from "@/lib/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quiz } from "@/types/quiz";

export default function Home() {
    const [playerName, setPlayerName] = useState("");
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [creatingGame, setCreatingGame] = useState(false);
    const [quizId, setQuizId] = useState<number | null>(null);
    const [errors, setErrors] = useState({
        quiz: "",
        playerName: ""
    });
    const router = useRouter();

    useEffect(() => {
        const getQuizzes = async () => {
            try {
                const response = await fetch(`${API_URL}/quizzes`);
                if (!response.ok) {
                    console.error(`Response status: ${response.status}`);
                    return;
                }
                const data = await response.json();
                setQuizzes(data);
            } catch (error) {
                console.error("Failed to load quizzes:", error);
            } finally {
                setLoadingQuizzes(false);
            }
        }

        getQuizzes();
    }, []);

    const handleCreate = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors = {
            quiz: quizId == null ? "Please select a quiz." : "",
            playerName: !playerName.trim() ? "Please enter your name." : ""
        };

        setErrors(newErrors);

        if (newErrors.quiz || newErrors.playerName) {
            return;
        }
        setCreatingGame(true);

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
        setCreatingGame(false)
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
                    onChange={(e) => {
                        setPlayerName(e.target.value);
                        setErrors(prev => ({
                            ...prev,
                            playerName: ""
                        }));
                    }}
                    className="w-full rounded-lg border border-slate-200 p-3"
                />
                <h1 className="text-4xl font-bold">Choose quiz</h1>

                <form onSubmit={handleCreate}>
                    <div className="relative flex min-h-[180px] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
                        {loadingQuizzes ? (
                            <div
                                className="flex flex-1 flex-col items-center justify-center gap-4 p-6"
                                role="status"
                                aria-label="Loading quizzes"
                            >
                                <div className="relative flex h-12 w-12 items-center justify-center">
                                    {/* Outer spinning ring */}
                                    <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-slate-200 border-t-cyan-500 border-r-cyan-400" />

                                    {/* Pulsing center */}
                                    <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.7)]" />
                                </div>

                            </div>
                        ) : quizzes.length > 0 ? (
                            <nav className="flex min-w-[240px] flex-col gap-1 p-1.5">
                                {quizzes.map((quiz) => (
                                    <div
                                        key={quiz.id}
                                        onClick={() => setQuizId(quiz.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                setQuizId(quiz.id);
                                            }
                                        }}
                                        aria-pressed={quizId === quiz.id}
                                        className={`flex w-full cursor-pointer items-center rounded-md p-3 text-left text-slate-800 transition-all
                        ${quizId === quiz.id ? "bg-slate-200" : "hover:bg-slate-100"}`}
                                    >
                                        {quiz.title}
                                    </div>
                                ))}
                            </nav>
                        ) : (
                            <div className="flex flex-1 items-center justify-center p-6 text-sm text-slate-500">
                                No quizzes available.
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={creatingGame}
                        className="m-3 inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {creatingGame && (
                            <svg
                                className="h-5 w-5 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-90"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                        )}

                        {creatingGame ? "Creating Game..." : "Create Game"}
                    </button>
                </form>
                {errors.quiz && errors.playerName ? (
                    <p role="alert" className="text-sm text-red-500">
                        Please select a quiz and enter your name.
                    </p>
                ) : (
                    <>
                        {errors.quiz && (
                            <p role="alert" className="text-sm text-red-500">
                                {errors.quiz}
                            </p>
                        )}

                        {errors.playerName && (
                            <p role="alert" className="text-sm text-red-500">
                                {errors.playerName}
                            </p>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}