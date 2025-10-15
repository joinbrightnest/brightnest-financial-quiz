import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Regenerating Prisma client...');
    
    // Regenerate Prisma client
    const { stdout, stderr } = await execAsync('npx prisma generate');
    
    console.log('✅ Prisma client regenerated successfully');
    console.log('stdout:', stdout);
    if (stderr) console.log('stderr:', stderr);
    
    return NextResponse.json({
      success: true,
      message: "Prisma client regenerated successfully",
      output: stdout
    });
  } catch (error) {
    console.error('❌ Error regenerating Prisma client:', error);
    return NextResponse.json(
      { 
        error: "Failed to regenerate Prisma client", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
