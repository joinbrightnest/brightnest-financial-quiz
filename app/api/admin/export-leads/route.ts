import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin authentication required' },
      { status: 401 }
    );
  }
  
  try {
    const { filters, exportOptions } = await request.json();
    
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

    // Date filtering
    if (filters.dateRange !== 'all' || filters.startDate || filters.endDate) {
      const dateFilter: any = {};
      
      if (filters.dateRange === '7days') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter.gte = weekAgo;
      } else if (filters.dateRange === '30days') {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        dateFilter.gte = monthAgo;
      } else if (filters.dateRange === '90days') {
        const quarterAgo = new Date();
        quarterAgo.setDate(quarterAgo.getDate() - 90);
        dateFilter.gte = quarterAgo;
      }
      
      if (filters.startDate) {
        dateFilter.gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        dateFilter.lte = endDate;
      }
      
      whereClause.createdAt = dateFilter;
    }

    // Handle selected lead IDs if provided
    if (filters.selectedLeadIds && filters.selectedLeadIds.length > 0) {
      whereClause.id = {
        in: filters.selectedLeadIds
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

    // Build CSV headers based on export options
    const csvHeaders: string[] = [];
    const fieldMap: { [key: string]: string } = {};

    if (exportOptions.selectedFields.includes('sessionId')) {
      csvHeaders.push('Session ID');
      fieldMap.sessionId = 'Session ID';
    }
    if (exportOptions.selectedFields.includes('quizType')) {
      csvHeaders.push('Quiz Type');
      fieldMap.quizType = 'Quiz Type';
    }
    if (exportOptions.selectedFields.includes('name') && exportOptions.includeContactInfo) {
      csvHeaders.push('Name');
      fieldMap.name = 'Name';
    }
    if (exportOptions.selectedFields.includes('email') && exportOptions.includeContactInfo) {
      csvHeaders.push('Email');
      fieldMap.email = 'Email';
    }
    if (exportOptions.selectedFields.includes('status')) {
      csvHeaders.push('Status');
      fieldMap.status = 'Status';
    }
    if (exportOptions.selectedFields.includes('archetype') && exportOptions.includeResults) {
      csvHeaders.push('Archetype');
      fieldMap.archetype = 'Archetype';
    }
    if (exportOptions.selectedFields.includes('createdAt') && exportOptions.includeTimestamps) {
      csvHeaders.push('Started At');
      fieldMap.createdAt = 'Started At';
    }
    if (exportOptions.selectedFields.includes('completedAt') && exportOptions.includeTimestamps) {
      csvHeaders.push('Completed At');
      fieldMap.completedAt = 'Completed At';
    }
    if (exportOptions.selectedFields.includes('answers') && exportOptions.includeAnswers) {
      csvHeaders.push('Answers Count');
      fieldMap.answersCount = 'Answers Count';
      
      // Add individual answer columns
      const allQuestions = new Set();
      leads.forEach(lead => {
        lead.answers.forEach(answer => {
          allQuestions.add(`${answer.question.order}_${answer.question.prompt.slice(0, 30)}`);
        });
      });
      
      Array.from(allQuestions).forEach(questionKey => {
        csvHeaders.push(`Q${questionKey}`);
        fieldMap[`answer_${questionKey}`] = `Q${questionKey}`;
      });
    }

    const csvRows = leads.map(lead => {
      const nameAnswer = lead.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('name') ||
        a.question?.text?.toLowerCase().includes('name')
      );
      const emailAnswer = lead.answers.find(a => 
        a.question?.prompt?.toLowerCase().includes('email') ||
        a.question?.text?.toLowerCase().includes('email')
      );
      
      const row: string[] = [];
      
      // Add fields based on export options
      if (exportOptions.selectedFields.includes('sessionId')) {
        row.push(lead.id);
      }
      if (exportOptions.selectedFields.includes('quizType')) {
        row.push(lead.quizType);
      }
      if (exportOptions.selectedFields.includes('name') && exportOptions.includeContactInfo) {
        row.push(nameAnswer?.value || '');
      }
      if (exportOptions.selectedFields.includes('email') && exportOptions.includeContactInfo) {
        row.push(emailAnswer?.value || '');
      }
      if (exportOptions.selectedFields.includes('status')) {
        row.push(lead.status);
      }
      if (exportOptions.selectedFields.includes('archetype') && exportOptions.includeResults) {
        row.push(lead.result?.archetype || '');
      }
      if (exportOptions.selectedFields.includes('createdAt') && exportOptions.includeTimestamps) {
        row.push(lead.createdAt.toISOString());
      }
      if (exportOptions.selectedFields.includes('completedAt') && exportOptions.includeTimestamps) {
        row.push(lead.completedAt?.toISOString() || '');
      }
      if (exportOptions.selectedFields.includes('answers') && exportOptions.includeAnswers) {
        row.push(lead.answers.length.toString());
        
        // Add individual answers
        const allQuestions = new Set();
        leads.forEach(l => {
          l.answers.forEach(answer => {
            allQuestions.add(`${answer.question.order}_${answer.question.prompt.slice(0, 30)}`);
          });
        });
        
        Array.from(allQuestions).forEach(questionKey => {
          const answer = lead.answers.find(a => 
            `${a.question.order}_${a.question.prompt.slice(0, 30)}` === questionKey
          );
          row.push(answer?.value || '');
        });
      }

      return row;
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
