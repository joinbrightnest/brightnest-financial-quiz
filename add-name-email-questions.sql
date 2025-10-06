-- Add name and email questions in the middle of the quiz
-- First, let's update the existing questions to make room for name/email

-- Update question 6 to be name question
UPDATE "quiz_questions" 
SET prompt = 'What''s your first name?', 
    type = 'text',
    options = '[{"label":"Enter your name","value":"name_input","weightCategory":"contact","weightValue":0}]'
WHERE id = 'q6';

-- Update question 7 to be email question  
UPDATE "quiz_questions"
SET prompt = 'What''s your email address?',
    type = 'email', 
    options = '[{"label":"Enter your email","value":"email_input","weightCategory":"contact","weightValue":0}]'
WHERE id = 'q7';

-- Now we need to shift the remaining questions down by 2 positions
-- Update question 8 (was question 6)
UPDATE "quiz_questions"
SET prompt = 'How often do you check your bank account?',
    type = 'single',
    options = '[{"label":"Daily - I''m very hands-on","value":"daily_check","weightCategory":"spending","weightValue":2},{"label":"Weekly - I like to stay informed","value":"weekly_check","weightCategory":"savings","weightValue":2},{"label":"Monthly - I review my statements","value":"monthly_check","weightCategory":"investing","weightValue":2},{"label":"Rarely - I trust my automatic systems","value":"rarely_check","weightCategory":"debt","weightValue":1}]'
WHERE id = 'q8';

-- Update question 9 (was question 7)
UPDATE "quiz_questions"
SET prompt = 'What''s your biggest financial worry?',
    type = 'single',
    options = '[{"label":"Not having enough for retirement","value":"retirement_worry","weightCategory":"investing","weightValue":3},{"label":"Unexpected medical expenses","value":"medical_worry","weightCategory":"savings","weightValue":3},{"label":"Losing my job or income","value":"job_worry","weightCategory":"spending","weightValue":2},{"label":"Never paying off my debt","value":"debt_worry","weightCategory":"debt","weightValue":3}]'
WHERE id = 'q9';

-- Update question 10 (was question 8)
UPDATE "quiz_questions"
SET prompt = 'How do you prefer to learn about finances?',
    type = 'single',
    options = '[{"label":"Reading books and articles","value":"reading","weightCategory":"investing","weightValue":2},{"label":"Watching videos and courses","value":"videos","weightCategory":"savings","weightValue":2},{"label":"Working with a financial advisor","value":"advisor","weightCategory":"spending","weightValue":2},{"label":"Learning through trial and error","value":"trial_error","weightCategory":"debt","weightValue":1}]'
WHERE id = 'q10';

-- Add the remaining 2 questions (was questions 9 & 10)
INSERT INTO "quiz_questions" (id, "order", prompt, type, options, active, "createdAt", "updatedAt") VALUES
('q11', 11, 'What''s your ideal financial future?', 'single',
 '[{"label":"Complete financial freedom and early retirement","value":"early_retirement","weightCategory":"investing","weightValue":3},{"label":"A comfortable, secure lifestyle","value":"comfortable_lifestyle","weightCategory":"savings","weightValue":3},{"label":"Being able to help family and friends","value":"help_others","weightCategory":"spending","weightValue":2},{"label":"Just getting out of debt and staying there","value":"debt_free_life","weightCategory":"debt","weightValue":3}]',
 true, NOW(), NOW()),

('q12', 12, 'How do you handle financial stress?', 'single',
 '[{"label":"I create a detailed plan and stick to it","value":"detailed_plan","weightCategory":"spending","weightValue":2},{"label":"I focus on increasing my income","value":"increase_income","weightCategory":"investing","weightValue":2},{"label":"I cut expenses and save more","value":"cut_expenses_save","weightCategory":"savings","weightValue":3},{"label":"I try to ignore it and hope it gets better","value":"ignore_stress","weightCategory":"debt","weightValue":1}]',
 true, NOW(), NOW());
