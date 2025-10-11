import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { filters } = await request.json();
    
    // Build the where clause based on filters
    const whereClause: any = {};
    
    if (filters.quizType !== 'all') {
      whereClause.quizType = filters.quizType;
    }
    
    if (filters.status !== 'all') {
      whereClause.status = filters.status;
    }
    
    if (filters.archetype !== 'all') {
      whereClause.result = {
        archetype: filters.archetype
      };
    }

    // Fetch leads with their answers and results
    const leads = await prisma.quizSession.findMany({
      where: whereClause,
      include: {
        answers: {
          include: {
            question: true
          }
        },
        result: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convert to CSV format
    const csvHeaders = [
      'Session ID',
      'Quiz Type',
      'Name',
      'Email',
      'Status',
      'Started At',
      'Completed At',
      'Archetype',
      'Answers Count',
      'Answers JSON'
    ];

    const csvRows = leads.map(lead => {
      const nameAnswer = lead.answers.find(a => a.question.type === "text");
      const emailAnswer = lead.answers.find(a => a.question.type === "email");
      
      // Create a structured answers object
      const answersObject = lead.answers.reduce((acc, answer) => {
        acc[`Q${answer.question.order}_${answer.question.prompt.slice(0, 50)}`] = answer.value;
        return acc;
      }, {} as any);

      return [
        lead.id,
        lead.quizType,
        nameAnswer?.value || '',
        emailAnswer?.value || '',
        lead.status,
        lead.createdAt.toISOString(),
        lead.completedAt?.toISOString() || '',
        lead.result?.archetype || '',
        lead.answers.length.toString(),
        JSON.stringify(answersObject)
      ];
    });

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
}
