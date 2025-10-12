import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ResultsClientComponent from "./ResultsClientComponent";

interface Result {
  id: string;
  archetype: string;
  scores: {
    debt: number;
    savings: number;
    spending: number;
    investing: number;
  };
}

async function getResult(id: string): Promise<Result | null> {
  try {
    const result = await prisma.result.findUnique({
      where: { id },
      select: {
        id: true,
        archetype: true,
        scores: true,
      },
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      archetype: result.archetype,
      scores: result.scores as {
        debt: number;
        savings: number;
        spending: number;
        investing: number;
      },
    };
  } catch (error) {
    console.error("Error fetching result:", error);
    return null;
  }
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">Result not found</p>
            <Link
              href="/quiz"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Take Quiz Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ResultsClientComponent result={result} />;
}
