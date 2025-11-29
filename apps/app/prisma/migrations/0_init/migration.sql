-- CreateEnum
CREATE TYPE "AffiliateTier" AS ENUM ('quiz', 'creator', 'agency');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('stripe', 'paypal', 'wise');

-- CreateEnum
CREATE TYPE "ConversionStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('held', 'available', 'paid');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'no_show', 'cancelled', 'rescheduled');

-- CreateEnum
CREATE TYPE "CallOutcome" AS ENUM ('converted', 'not_interested', 'needs_follow_up', 'wrong_number', 'no_answer', 'callback_requested', 'rescheduled');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "quizType" TEXT NOT NULL DEFAULT 'financial-profile',
    "affiliate_code" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quizType" TEXT NOT NULL DEFAULT 'financial-profile',
    "order" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "skipButton" BOOLEAN NOT NULL DEFAULT false,
    "continueButton" BOOLEAN NOT NULL DEFAULT false,
    "continueButtonColor" TEXT NOT NULL DEFAULT '#09727c',
    "continueButtonText" TEXT NOT NULL DEFAULT 'Continue',
    "textUnderAnswers" TEXT,
    "textUnderButton" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "dwellMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "archetype" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "subtitle" TEXT,
    "personalizedText" TEXT,
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "iconColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "accentColor" TEXT NOT NULL DEFAULT '#ef4444',
    "iconType" TEXT NOT NULL DEFAULT 'document',
    "showIcon" BOOLEAN NOT NULL DEFAULT true,
    "showStatistic" BOOLEAN NOT NULL DEFAULT true,
    "statisticText" TEXT,
    "statisticValue" TEXT,
    "ctaText" TEXT NOT NULL DEFAULT 'CONTINUE',
    "showCta" BOOLEAN NOT NULL DEFAULT true,
    "textAlignment" TEXT NOT NULL DEFAULT 'center',
    "contentPosition" TEXT NOT NULL DEFAULT 'center',
    "backgroundStyle" TEXT NOT NULL DEFAULT 'solid',
    "backgroundGradient" TEXT,
    "contentPadding" TEXT NOT NULL DEFAULT 'normal',
    "showTopBar" BOOLEAN NOT NULL DEFAULT true,
    "topBarColor" TEXT NOT NULL DEFAULT '#1f2937',
    "titleFontSize" TEXT NOT NULL DEFAULT 'large',
    "titleFontWeight" TEXT NOT NULL DEFAULT 'bold',
    "contentFontSize" TEXT NOT NULL DEFAULT 'normal',
    "contentFontWeight" TEXT NOT NULL DEFAULT 'normal',
    "lineHeight" TEXT NOT NULL DEFAULT 'normal',
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "showImage" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_triggers" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "questionId" TEXT,
    "optionValue" TEXT,
    "condition" JSONB NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "variables" JSONB NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_views" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loading_screens" (
    "id" TEXT NOT NULL,
    "quizType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "personalizedText" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 3000,
    "iconType" TEXT NOT NULL DEFAULT 'puzzle-4',
    "animationStyle" TEXT NOT NULL DEFAULT 'complete-rotate',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#000000',
    "iconColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "progressBarColor" TEXT NOT NULL DEFAULT '#ef4444',
    "progressBarFillColor" TEXT NOT NULL DEFAULT '#fb513d',
    "progressBarBgColor" TEXT NOT NULL DEFAULT '#e4dece',
    "progressBarTextColor" TEXT NOT NULL DEFAULT '#191717',
    "showProgressBar" BOOLEAN NOT NULL DEFAULT true,
    "progressText" TEXT,
    "showTopBar" BOOLEAN NOT NULL DEFAULT true,
    "topBarColor" TEXT NOT NULL DEFAULT '#1f2937',
    "triggerQuestionId" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "showImage" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loading_screens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "tier" "AffiliateTier" NOT NULL DEFAULT 'quiz',
    "referral_code" TEXT NOT NULL,
    "custom_link" TEXT NOT NULL,
    "payout_method" "PayoutMethod",
    "payout_details" JSONB,
    "commission_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.1000,
    "total_clicks" INTEGER NOT NULL DEFAULT 0,
    "total_leads" INTEGER NOT NULL DEFAULT 0,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "total_commission" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "stripe_account_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_clicks" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "normal_website_clicks" (
    "id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "normal_website_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_conversions" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "quiz_session_id" TEXT,
    "referral_code" TEXT NOT NULL,
    "conversion_type" TEXT NOT NULL,
    "status" "ConversionStatus" NOT NULL DEFAULT 'pending',
    "commission_amount" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "sale_value" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "commission_status" "CommissionStatus" NOT NULL DEFAULT 'held',
    "hold_until" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_payouts" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "amount_due" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "stripe_transfer_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_audit_logs" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "calendly_link" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "commission_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.1500,
    "total_calls" INTEGER NOT NULL DEFAULT 0,
    "total_conversions" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "conversion_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "closer_id" TEXT,
    "calendly_event_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_email" TEXT NOT NULL,
    "customer_phone" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "outcome" "CallOutcome",
    "notes" TEXT,
    "recording_link" TEXT,
    "recording_link_converted" TEXT,
    "recording_link_not_interested" TEXT,
    "recording_link_needs_follow_up" TEXT,
    "recording_link_wrong_number" TEXT,
    "recording_link_no_answer" TEXT,
    "recording_link_callback_requested" TEXT,
    "recording_link_rescheduled" TEXT,
    "sale_value" DECIMAL(10,2),
    "commission_amount" DECIMAL(10,2),
    "affiliate_code" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "lead_email" TEXT,
    "closer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'medium',
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "lead_email" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" TEXT,
    "created_by_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closer_audit_logs" (
    "id" TEXT NOT NULL,
    "closer_id" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "closer_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closer_scripts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "call_script" TEXT NOT NULL,
    "program_details" JSONB,
    "email_templates" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closer_scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closer_script_assignments" (
    "id" TEXT NOT NULL,
    "closer_id" TEXT NOT NULL,
    "script_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "closer_script_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "quiz_sessions_affiliate_code_idx" ON "quiz_sessions"("affiliate_code");

-- CreateIndex
CREATE INDEX "quiz_sessions_completedAt_idx" ON "quiz_sessions"("completedAt");

-- CreateIndex
CREATE INDEX "quiz_sessions_status_quizType_idx" ON "quiz_sessions"("status", "quizType");

-- CreateIndex
CREATE INDEX "quiz_sessions_createdAt_idx" ON "quiz_sessions"("createdAt");

-- CreateIndex
CREATE INDEX "quiz_sessions_affiliate_code_createdAt_idx" ON "quiz_sessions"("affiliate_code", "createdAt");

-- CreateIndex
CREATE INDEX "quiz_sessions_affiliate_code_status_createdAt_idx" ON "quiz_sessions"("affiliate_code", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_sessionId_questionId_key" ON "quiz_answers"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "results_sessionId_key" ON "results"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "article_views_sessionId_articleId_key" ON "article_views"("sessionId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_email_key" ON "affiliates"("email");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_referral_code_key" ON "affiliates"("referral_code");

-- CreateIndex
CREATE INDEX "affiliates_is_approved_is_active_idx" ON "affiliates"("is_approved", "is_active");

-- CreateIndex
CREATE INDEX "affiliates_created_at_idx" ON "affiliates"("created_at");

-- CreateIndex
CREATE INDEX "affiliate_clicks_affiliate_id_created_at_idx" ON "affiliate_clicks"("affiliate_id", "created_at");

-- CreateIndex
CREATE INDEX "affiliate_clicks_created_at_idx" ON "affiliate_clicks"("created_at");

-- CreateIndex
CREATE INDEX "affiliate_clicks_referral_code_created_at_idx" ON "affiliate_clicks"("referral_code", "created_at");

-- CreateIndex
CREATE INDEX "normal_website_clicks_created_at_idx" ON "normal_website_clicks"("created_at");

-- CreateIndex
CREATE INDEX "affiliate_conversions_affiliate_id_idx" ON "affiliate_conversions"("affiliate_id");

-- CreateIndex
CREATE INDEX "affiliate_conversions_commission_status_hold_until_idx" ON "affiliate_conversions"("commission_status", "hold_until");

-- CreateIndex
CREATE INDEX "affiliate_conversions_created_at_idx" ON "affiliate_conversions"("created_at");

-- CreateIndex
CREATE INDEX "affiliate_conversions_referral_code_created_at_idx" ON "affiliate_conversions"("referral_code", "created_at");

-- CreateIndex
CREATE INDEX "affiliate_conversions_affiliate_id_commission_status_create_idx" ON "affiliate_conversions"("affiliate_id", "commission_status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "closers_email_key" ON "closers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_calendly_event_id_key" ON "appointments"("calendly_event_id");

-- CreateIndex
CREATE INDEX "appointments_closer_id_outcome_idx" ON "appointments"("closer_id", "outcome");

-- CreateIndex
CREATE INDEX "appointments_affiliate_code_idx" ON "appointments"("affiliate_code");

-- CreateIndex
CREATE INDEX "appointments_scheduled_at_idx" ON "appointments"("scheduled_at");

-- CreateIndex
CREATE INDEX "appointments_outcome_idx" ON "appointments"("outcome");

-- CreateIndex
CREATE INDEX "appointments_created_at_idx" ON "appointments"("created_at");

-- CreateIndex
CREATE INDEX "appointments_affiliate_code_scheduled_at_idx" ON "appointments"("affiliate_code", "scheduled_at");

-- CreateIndex
CREATE INDEX "appointments_affiliate_code_status_scheduled_at_idx" ON "appointments"("affiliate_code", "status", "scheduled_at");

-- CreateIndex
CREATE INDEX "tasks_lead_email_status_idx" ON "tasks"("lead_email", "status");

-- CreateIndex
CREATE INDEX "tasks_closer_id_status_idx" ON "tasks"("closer_id", "status");

-- CreateIndex
CREATE INDEX "tasks_due_date_status_idx" ON "tasks"("due_date", "status");

-- CreateIndex
CREATE INDEX "notes_lead_email_idx" ON "notes"("lead_email");

-- CreateIndex
CREATE INDEX "notes_created_at_idx" ON "notes"("created_at");

-- CreateIndex
CREATE INDEX "closer_script_assignments_closer_id_idx" ON "closer_script_assignments"("closer_id");

-- CreateIndex
CREATE INDEX "closer_script_assignments_script_id_idx" ON "closer_script_assignments"("script_id");

-- CreateIndex
CREATE UNIQUE INDEX "closer_script_assignments_closer_id_script_id_key" ON "closer_script_assignments"("closer_id", "script_id");

-- AddForeignKey
ALTER TABLE "quiz_sessions" ADD CONSTRAINT "quiz_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "quiz_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "quiz_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_triggers" ADD CONSTRAINT "article_triggers_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_triggers" ADD CONSTRAINT "article_triggers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "quiz_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loading_screens" ADD CONSTRAINT "loading_screens_triggerQuestionId_fkey" FOREIGN KEY ("triggerQuestionId") REFERENCES "quiz_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_clicks" ADD CONSTRAINT "affiliate_clicks_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_audit_logs" ADD CONSTRAINT "affiliate_audit_logs_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_closer_id_fkey" FOREIGN KEY ("closer_id") REFERENCES "closers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_closer_id_fkey" FOREIGN KEY ("closer_id") REFERENCES "closers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closer_audit_logs" ADD CONSTRAINT "closer_audit_logs_closer_id_fkey" FOREIGN KEY ("closer_id") REFERENCES "closers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closer_script_assignments" ADD CONSTRAINT "closer_script_assignments_closer_id_fkey" FOREIGN KEY ("closer_id") REFERENCES "closers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closer_script_assignments" ADD CONSTRAINT "closer_script_assignments_script_id_fkey" FOREIGN KEY ("script_id") REFERENCES "closer_scripts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

