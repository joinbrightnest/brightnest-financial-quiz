import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, quizType, dateRange, selectedIds, exportType } = body;

    // Calculate date filter
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (quizType && quizType !== "all") {
      whereClause.quizType = quizType;
    }

    if (selectedIds && selectedIds.length > 0) {
      whereClause.id = {
        in: selectedIds,
      };
    }

    // Fetch data based on export type
    let data;
    if (exportType === "ceo-global") {
      data = await getCEOExportData(whereClause);
    } else {
      data = await getDetailedExportData(whereClause);
    }

    if (format === "crm") {
      // Send to CRM (mock implementation)
      return await sendToCRM(data);
    } else if (format === "csv") {
      return await exportToCSV(data, exportType);
    } else if (format === "json") {
      return await exportToJSON(data);
    } else {
      return NextResponse.json(
        { error: "Invalid export format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Export API error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

async function getDetailedExportData(whereClause: any) {
  const sessions = await prisma.quizSession.findMany({
    where: whereClause,
    include: {
      user: true,
      result: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return sessions.map((session) => ({
    sessionId: session.id,
    quizType: session.quizType,
    status: session.status,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationMs: session.durationMs,
    userEmail: session.user?.email || "Anonymous",
    archetype: session.result?.archetype || "N/A",
    scores: session.result?.scores || {},
    answersCount: session.answers.length,
    answers: session.answers.map((answer) => ({
      question: answer.question.prompt,
      answer: answer.value,
      answeredAt: answer.createdAt,
    })),
  }));
}

async function getCEOExportData(whereClause: any) {
  const [
    sessions,
    quizTypeStats,
    archetypeStats,
    timeSeriesData,
  ] = await Promise.all([
    prisma.quizSession.findMany({
      where: whereClause,
      include: {
        user: true,
        result: true,
      },
    }),
    prisma.quizSession.groupBy({
      by: ["quizType"],
      where: whereClause,
      _count: {
        quizType: true,
      },
    }),
    prisma.result.groupBy({
      by: ["archetype"],
      where: {
        session: whereClause,
      },
      _count: {
        archetype: true,
      },
    }),
    getTimeSeriesData(whereClause),
  ]);

  return {
    summary: {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === "completed").length,
      conversionRate: sessions.length > 0 ? (sessions.filter(s => s.status === "completed").length / sessions.length) * 100 : 0,
      uniqueUsers: new Set(sessions.map(s => s.user?.email).filter(Boolean)).size,
    },
    quizTypeDistribution: quizTypeStats,
    archetypeDistribution: archetypeStats,
    timeSeriesData,
    sessions: sessions.map(session => ({
      sessionId: session.id,
      quizType: session.quizType,
      status: session.status,
      userEmail: session.user?.email || "Anonymous",
      archetype: session.result?.archetype || "N/A",
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    })),
  };
}

async function getTimeSeriesData(whereClause: any) {
  const now = new Date();
  const data = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const [total, completed] = await Promise.all([
      prisma.quizSession.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }),
      prisma.quizSession.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
          status: "completed",
        },
      }),
    ]);

    data.push({
      date: dayStart.toISOString().split('T')[0],
      total,
      completed,
    });
  }

  return data;
}

async function sendToCRM(data: any) {
  // Mock CRM integration
  console.log("Sending data to CRM:", {
    recordCount: Array.isArray(data) ? data.length : data.sessions?.length || 0,
    timestamp: new Date().toISOString(),
  });

  // Simulate API call to CRM
  await new Promise(resolve => setTimeout(resolve, 1000));

  return NextResponse.json({
    success: true,
    message: `Successfully sent ${Array.isArray(data) ? data.length : data.sessions?.length || 0} records to CRM`,
    timestamp: new Date().toISOString(),
  });
}

async function exportToCSV(data: any, exportType?: string) {
  let csvContent = "";
  
  if (exportType === "ceo-global") {
    // CEO export format
    csvContent = "Date,Total Sessions,Completed Sessions,Conversion Rate\n";
    if (data.timeSeriesData) {
      data.timeSeriesData.forEach((day: any) => {
        const conversionRate = day.total > 0 ? ((day.completed / day.total) * 100).toFixed(2) : "0.00";
        csvContent += `${day.date},${day.total},${day.completed},${conversionRate}%\n`;
      });
    }
  } else {
    // Detailed export format
    csvContent = "Session ID,Quiz Type,Status,User Email,Archetype,Started At,Completed At,Duration (ms),Answers Count\n";
    data.forEach((session: any) => {
      csvContent += `"${session.sessionId}","${session.quizType}","${session.status}","${session.userEmail}","${session.archetype}","${session.startedAt}","${session.completedAt || ""}","${session.durationMs || ""}","${session.answersCount}"\n`;
    });
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="brightnest-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

async function exportToJSON(data: any) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="brightnest-analytics-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
