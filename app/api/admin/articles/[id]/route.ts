import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/admin-auth-server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
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
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }
  
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
      showCta,
      // Layout and positioning fields
      textAlignment,
      contentPosition,
      backgroundStyle,
      backgroundGradient,
      contentPadding,
      showTopBar,
      topBarColor,
      // Text formatting fields
      titleFontSize,
      titleFontWeight,
      contentFontSize,
      contentFontWeight,
      lineHeight
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
        showCta: showCta !== undefined ? showCta : true,
        // Layout and positioning fields
        textAlignment: textAlignment || 'left',
        contentPosition: contentPosition || 'center',
        backgroundStyle: backgroundStyle || 'solid',
        backgroundGradient: backgroundGradient !== undefined ? backgroundGradient : null,
        contentPadding: contentPadding || 'normal',
        showTopBar: showTopBar !== undefined ? showTopBar : true,
        topBarColor: topBarColor || '#1f2937',
        // Text formatting fields
        titleFontSize: titleFontSize || 'large',
        titleFontWeight: titleFontWeight || 'bold',
        contentFontSize: contentFontSize || 'normal',
        contentFontWeight: contentFontWeight || 'normal',
        lineHeight: lineHeight || 'normal'
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
