import { NextRequest, NextResponse } from "next/server";
import { articleService } from "@/lib/article-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, articleId } = body;

    if (!sessionId || !articleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Record article view
    await articleService.recordArticleView(sessionId, articleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording article view:', error);
    return NextResponse.json(
      { error: 'Failed to record article view' },
      { status: 500 }
    );
  }
}
