import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function Home() {

  return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="text-center space-y-6">
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Pulse</h1>

              <p className="text-gray-600 dark:text-gray-400">
          A live quiz game.
        </p>

        <div className="flex gap-4 justify-center">
                  <Link href="game/create" className="px-6 py-3 rounded-lg bg-black text-white dark:bg-white dark:text-slate-900 hover:opacity-90">
                Create Game
            </Link>

                  <Link href="game/join" className="px-6 py-3 rounded-lg border border-gray-300 text-gray-900 dark:border-slate-700 dark:text-gray-100 dark:hover:bg-slate-800">
            Join Game
            </Link>
        </div>
      </div>
    </main>
  );
}