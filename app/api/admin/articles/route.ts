import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Articles API - Starting request');
    
    // Get articles with their triggers
    const articles = await prisma.article.findMany({
      where: {
        isActive: true
      },
      include: {
        triggers: {
          where: { isActive: true },
          include: {
            question: {
              select: { prompt: true, quizType: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('🔍 Articles API - Found articles:', articles.length);
    
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('💥 Articles API - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      content, 
      type, 
      category, 
      tags, 
      triggers,
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

    // Create article in database
    const article = await prisma.article.create({
      data: {
        title,
        content,
        type: type || 'ai_generated',
        category: category || 'general',
        tags: tags || [],
        // Customization fields
        subtitle: subtitle || null,
        personalizedText: personalizedText || null,
        backgroundColor: backgroundColor || '#ffffff',
        textColor: textColor || '#000000',
        iconColor: iconColor || '#3b82f6',
        accentColor: accentColor || '#ef4444',
        iconType: iconType || 'document',
        showIcon: showIcon !== undefined ? showIcon : true,
        showStatistic: showStatistic !== undefined ? showStatistic : true,
        statisticText: statisticText || null,
        statisticValue: statisticValue || null,
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
        lineHeight: lineHeight || 'normal',
        triggers: {
          create: triggers?.map((trigger: any) => ({
            questionId: trigger.questionId,
            optionValue: trigger.optionValue,
            condition: trigger.condition || {},
            priority: trigger.priority || 0,
            isActive: trigger.isActive !== false
          })) || []
        }
      },
      include: {
        triggers: {
          include: {
            question: {
              select: { prompt: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      article,
      message: 'Article saved successfully to database'
    });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}