import { NextRequest, NextResponse } from "next/server";
import { articleTestingFramework } from "@/lib/article-testing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, iterations = 10 } = body;

    let results;

    switch (testType) {
      case 'all':
        results = await articleTestingFramework.runAllTests();
        break;
      
      case 'performance':
        results = await articleTestingFramework.runPerformanceTest(iterations);
        break;
      
      case 'a_b':
        const { scenarioA, scenarioB } = body;
        results = await articleTestingFramework.runA_BTest(scenarioA, scenarioB, iterations);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid test type. Use: all, performance, or a_b' },
          { status: 400 }
        );
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Testing error:', error);
    return NextResponse.json(
      { error: 'Failed to run tests' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'all';

    let results;
    let report = '';

    if (testType === 'all') {
      results = await articleTestingFramework.runAllTests();
      report = articleTestingFramework.generateTestReport(results);
    } else if (testType === 'performance') {
      const iterations = parseInt(searchParams.get('iterations') || '10');
      results = await articleTestingFramework.runPerformanceTest(iterations);
    }

    return NextResponse.json({
      results,
      report: report || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Testing error:', error);
    return NextResponse.json(
      { error: 'Failed to run tests' },
      { status: 500 }
    );
  }
}
