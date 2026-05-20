import {
  DifficultyLevel,
  InterviewMode,
  InterviewTrack,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companies = [
    { name: 'Google', slug: 'google', focusAreas: ['Algorithms', 'System Design'] as string[], difficulty: DifficultyLevel.HARD },
    { name: 'Meta', slug: 'meta', focusAreas: ['React', 'System Design'] as string[], difficulty: DifficultyLevel.HARD },
    { name: 'Amazon', slug: 'amazon', focusAreas: ['Leadership Principles', 'APIs'] as string[], difficulty: DifficultyLevel.MEDIUM },
    { name: 'Stripe', slug: 'stripe', focusAreas: ['API Design', 'Distributed Systems'] as string[], difficulty: DifficultyLevel.EXPERT },
    { name: 'Vercel', slug: 'vercel', focusAreas: ['Next.js', 'Edge', 'Performance'] as string[], difficulty: DifficultyLevel.HARD },
    { name: 'Linear', slug: 'linear', focusAreas: ['React', 'Performance', 'Product'] as string[], difficulty: DifficultyLevel.HARD },
  ];

  for (const c of companies) {
    await prisma.companySimulation.upsert({
      where: { slug: c.slug },
      create: c,
      update: c,
    });
  }

  await prisma.aiPrompt.upsert({
    where: { name: 'frontend-practice' },
    create: {
      name: 'frontend-practice',
      track: InterviewTrack.FRONTEND,
      mode: InterviewMode.PRACTICE,
      systemPrompt:
        'You are a principal frontend engineer at a top tech company. Ask rigorous, practical questions about React, TypeScript, performance, and accessibility. Be concise and professional.',
    },
    update: {},
  });

  const questions = [
    {
      text: 'Explain how React reconciliation works and when keys matter in lists.',
      track: InterviewTrack.FRONTEND,
      difficulty: DifficultyLevel.MEDIUM,
      topics: ['React', 'Internals'],
    },
    {
      text: 'Design a rate-limited API gateway for a multi-tenant SaaS.',
      track: InterviewTrack.BACKEND,
      difficulty: DifficultyLevel.HARD,
      topics: ['System Design', 'APIs'],
    },
    {
      text: 'How would you implement optimistic UI with rollback in a Next.js app?',
      track: InterviewTrack.FULLSTACK,
      difficulty: DifficultyLevel.MEDIUM,
      topics: ['Next.js', 'React', 'APIs'],
    },
  ];

  for (const q of questions) {
    const existing = await prisma.question.findFirst({ where: { text: q.text } });
    if (!existing) await prisma.question.create({ data: q });
  }

  console.log('Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
