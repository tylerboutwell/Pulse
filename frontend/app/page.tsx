import Link from "next/link";
import { API_URL } from "@/lib/api";

export default function Home() {

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold">Pulse</h1>

        <p className="text-gray-600">
          A live quiz game.
        </p>

        <div className="flex gap-4 justify-center">
            <Link href="game/create" className="px-6 py-3 rounded-lg bg-black text-white">
                Create Game
            </Link>

            <Link href="game/join" className="px-6 py-3 rounded-lg border border-gray-300">
            Join Game
            </Link>
        </div>
      </div>
    </main>
  );
}