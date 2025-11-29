import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth-server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

  try {
    console.log('🔍 Articles API - Starting optimized request');

    // 🚀 OPTIMIZED: Use raw SQL with JOINs to fetch all data in a single query
    // This eliminates the N+1 query problem where Prisma makes separate queries for each relation
    const articlesWithTriggers = await prisma.$queryRaw<Array<{
      id: string;
      title: string;
      content: string;
      type: string;
      category: string;
      tags: string[];
      subtitle: string | null;
      personalizedText: string | null;
      backgroundColor: string;
      textColor: string;
      iconColor: string;
      accentColor: string;
      iconType: string;
      showIcon: boolean;
      showStatistic: boolean;
      statisticText: string | null;
      statisticValue: string | null;
      ctaText: string;
      showCta: boolean;
      textAlignment: string;
      contentPosition: string;
      backgroundStyle: string;
      backgroundGradient: string | null;
      contentPadding: string;
      showTopBar: boolean;
      topBarColor: string;
      titleFontSize: string;
      titleFontWeight: string;
      contentFontSize: string;
      contentFontWeight: string;
      lineHeight: string;
      imageUrl: string | null;
      imageAlt: string | null;
      showImage: boolean;
      createdAt: Date;
      updatedAt: Date;
      triggers: any;
    }>>`
      SELECT 
        a.id,
        a.title,
        a.content,
        a.type,
        a.category,
        a.tags,
        a.subtitle,
        a."personalizedText",
        a."backgroundColor",
        a."textColor",
        a."iconColor",
        a."accentColor",
        a."iconType",
        a."showIcon",
        a."showStatistic",
        a."statisticText",
        a."statisticValue",
        a."ctaText",
        a."showCta",
        a."textAlignment",
        a."contentPosition",
        a."backgroundStyle",
        a."backgroundGradient",
        a."contentPadding",
        a."showTopBar",
        a."topBarColor",
        a."titleFontSize",
        a."titleFontWeight",
        a."contentFontSize",
        a."contentFontWeight",
        a."lineHeight",
        a."imageUrl",
        a."imageAlt",
        a."showImage",
        a."createdAt",
        a."updatedAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'questionId', t."questionId",
              'optionValue', t."optionValue",
              'condition', t.condition,
              'priority', t.priority,
              'isActive', t."isActive",
              'question', CASE 
                WHEN q.id IS NOT NULL THEN json_build_object(
                  'prompt', q.prompt,
                  'quizType', q."quizType"
                )
                ELSE NULL
              END
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as triggers
      FROM "Article" a
      LEFT JOIN "ArticleTrigger" t ON t."articleId" = a.id AND t."isActive" = true
      LEFT JOIN "QuizQuestion" q ON q.id = t."questionId"
      WHERE a."isActive" = true
      GROUP BY a.id
      ORDER BY a."createdAt" DESC
    `;

    console.log('🔍 Articles API - Found articles:', articlesWithTriggers.length);
    console.log('✅ Articles API - Optimized query completed in single database call');

    return NextResponse.json({ articles: articlesWithTriggers });
  } catch (error) {
    console.error('💥 Articles API - Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require admin authentication
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin authentication required" },
      { status: 401 }
    );
  }

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
      lineHeight,
      // Image fields
      imageUrl,
      imageAlt,
      showImage
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
        // Image fields
        imageUrl: imageUrl || null,
        imageAlt: imageAlt || null,
        showImage: showImage !== undefined ? showImage : false,
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