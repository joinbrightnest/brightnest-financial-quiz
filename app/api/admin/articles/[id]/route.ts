import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete triggers first (due to foreign key constraint)
    await prisma.articleTrigger.deleteMany({
      where: { articleId: id }
    });

    // Delete article views
    await prisma.articleView.deleteMany({
      where: { articleId: id }
    });

    // Delete article
    await prisma.article.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, 
      content, 
      category, 
      tags, 
      isActive,
      // Customization fields
      subtitle,
      personalizedText,
      backgroundColor,
      textColor,
      iconColor,
      accentColor,
      iconType,
      showIcon,
      showStatistic,
      statisticText,
      statisticValue,
      ctaText,
      showCta
    } = body;

    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        category,
        tags,
        isActive,
        // Customization fields
        subtitle: subtitle !== undefined ? subtitle : null,
        personalizedText: personalizedText !== undefined ? personalizedText : null,
        backgroundColor: backgroundColor || '#ffffff',
        textColor: textColor || '#000000',
        iconColor: iconColor || '#3b82f6',
        accentColor: accentColor || '#ef4444',
        iconType: iconType || 'document',
        showIcon: showIcon !== undefined ? showIcon : true,
        showStatistic: showStatistic !== undefined ? showStatistic : true,
        statisticText: statisticText !== undefined ? statisticText : null,
        statisticValue: statisticValue !== undefined ? statisticValue : null,
        ctaText: ctaText || 'CONTINUE',
        showCta: showCta !== undefined ? showCta : true
      }
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}
