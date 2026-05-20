import {
  InterviewMode,
  InterviewStatus,
  InterviewTrack,
} from '@prisma/client';
import { prisma } from '../lib/prisma';
import { analyzeAnswer, generateQuestion } from './ai-engine.service';
import { cacheGet, cacheSet } from '../lib/redis';

export async function startInterview(userId: string, data: {
  track: InterviewTrack;
  mode: InterviewMode;
  companySimulationId?: string;
}) {
  const interview = await prisma.interview.create({
    data: {
      userId,
      track: data.track,
      mode: data.mode,
      companySimulationId: data.companySimulationId,
      status: InterviewStatus.ACTIVE,
    },
  });

  const company = data.companySimulationId
    ? await prisma.companySimulation.findUnique({ where: { id: data.companySimulationId } })
    : null;

  const question = await generateQuestion({
    track: data.track,
    mode: data.mode,
    company: company?.name,
  });

  const q = await prisma.question.create({
    data: {
      text: question.text,
      track: data.track,
      difficulty: question.difficulty,
      topics: question.topics,
      company: company?.name,
    },
  });

  const greeting = await prisma.chatMessage.create({
    data: {
      interviewId: interview.id,
      role: 'assistant',
      content: `Welcome to your ${data.track.toLowerCase()} interview${company ? ` (${company.name} simulation)` : ''}.\n\n**Question 1:** ${question.text}`,
    },
  });

  await cacheSet(`interview:${interview.id}:question`, q.id, 3600);

  return { interview, question: q, message: greeting };
}

export async function submitAnswer(
  userId: string,
  interviewId: string,
  content: string,
  codeSnippet?: string
) {
  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, userId },
  });
  if (!interview) throw new Error('Interview not found');

  const questionId = await cacheGet<string>(`interview:${interviewId}:question`);
  const question = questionId
    ? await prisma.question.findUnique({ where: { id: questionId } })
    : null;

  await prisma.chatMessage.create({
    data: { interviewId, role: 'user', content },
  });

  const answer = await prisma.answer.create({
    data: { interviewId, questionId: question?.id, content, codeSnippet },
  });

  const analysisResult = await analyzeAnswer({
    question: question?.text ?? 'Technical question',
    answer: content,
    track: interview.track,
    codeSnippet,
  });

  const analysis = await prisma.analysis.create({
    data: {
      answerId: answer.id,
      strengths: analysisResult.strengths,
      gaps: analysisResult.gaps,
      idealAnswer: analysisResult.idealAnswer,
      followUpQuestions: analysisResult.followUpQuestions,
      coachingAdvice: analysisResult.coachingAdvice,
      overallScore: analysisResult.overallScore,
      seniorityLevel: analysisResult.seniorityLevel,
      hiringSignal: analysisResult.hiringSignal,
      behaviouralNotes: analysisResult.behaviouralNotes,
      scores: {
        create: analysisResult.scores.map((s) => ({
          dimension: s.name,
          score: s.score,
          maxScore: s.maxScore,
        })),
      },
    },
    include: { scores: true },
  });

  const feedbackContent = analysisResult.markdownResponse;
  await prisma.chatMessage.create({
    data: { interviewId, role: 'assistant', content: feedbackContent },
  });

  const nextQ = await generateQuestion({ track: interview.track, mode: interview.mode });
  const nextQuestion = await prisma.question.create({
    data: {
      text: nextQ.text,
      track: interview.track,
      difficulty: nextQ.difficulty,
      topics: nextQ.topics,
    },
  });
  await cacheSet(`interview:${interviewId}:question`, nextQuestion.id, 3600);

  await prisma.interview.update({
    where: { id: interviewId },
    data: {
      currentQuestionIndex: { increment: 1 },
      overallScore: analysisResult.overallScore,
      seniorityLevel: analysisResult.seniorityLevel,
      hiringSignal: analysisResult.hiringSignal,
    },
  });

  await updateUserAnalytics(userId, analysisResult.overallScore, analysisResult.gaps);

  return { analysis, nextQuestion };
}

async function updateUserAnalytics(userId: string, score: number, weakTopics: string[]) {
  const analytics = await prisma.userAnalytics.findUnique({ where: { userId } });
  const total = (analytics?.totalInterviews ?? 0) + 1;
  const avg = analytics
    ? (analytics.averageScore * analytics.totalInterviews + score) / total
    : score;

  await prisma.userAnalytics.upsert({
    where: { userId },
    create: {
      userId,
      totalInterviews: 1,
      averageScore: score,
      weakTopics: weakTopics.slice(0, 5),
    },
    update: {
      totalInterviews: total,
      averageScore: avg,
      weakTopics: weakTopics.slice(0, 8),
      lastActiveAt: new Date(),
    },
  });

  await prisma.progressSnapshot.create({
    data: { userId, score, date: new Date() },
  });
}

export async function completeInterview(userId: string, interviewId: string) {
  return prisma.interview.updateMany({
    where: { id: interviewId, userId },
    data: { status: InterviewStatus.COMPLETED, completedAt: new Date() },
  });
}

export async function getInterviewHistory(userId: string) {
  return prisma.interview.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    include: {
      answers: { include: { analysis: { include: { scores: true } } } },
      _count: { select: { messages: true } },
    },
    take: 50,
  });
}
