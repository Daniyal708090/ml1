import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  DifficultyLevel,
  HiringSignal,
  InterviewMode,
  InterviewTrack,
  SeniorityLevel,
} from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { calculateScores, type AnalysisOutput } from './scoring.service';

const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
const modelName = 'gemini-1.5-flash';

function mapSeniority(score: number): SeniorityLevel {
  if (score >= 9) return SeniorityLevel.PRINCIPAL;
  if (score >= 8) return SeniorityLevel.STAFF;
  if (score >= 6.5) return SeniorityLevel.SENIOR;
  if (score >= 4.5) return SeniorityLevel.MID;
  return SeniorityLevel.JUNIOR;
}

function mapHiringSignal(score: number): HiringSignal {
  if (score >= 8) return HiringSignal.HIRE;
  if (score >= 6.5) return HiringSignal.LEAN_HIRE;
  if (score >= 5) return HiringSignal.LEAN_NO_HIRE;
  return HiringSignal.NO_HIRE;
}

export async function generateQuestion(params: {
  track: InterviewTrack;
  mode: InterviewMode;
  difficulty?: DifficultyLevel;
  company?: string;
  weakTopics?: string[];
}): Promise<{ text: string; topics: string[]; difficulty: DifficultyLevel }> {
  const difficulty = params.difficulty ?? DifficultyLevel.MEDIUM;

  if (!genAI) {
    return {
      text: `[${params.track}] ${params.mode}: Explain a core engineering concept in depth${params.company ? ` (${params.company} bar)` : ''}.`,
      topics: ['General Engineering'],
      difficulty,
    };
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const promptRecord = await prisma.aiPrompt.findFirst({
    where: { isActive: true, track: params.track, mode: params.mode },
  });

  const systemInstruction =
    promptRecord?.systemPrompt ??
    `You are an elite ${params.track} engineering interviewer conducting a ${params.mode} interview. Your goal is to assess the candidate's deep technical knowledge.`;

  const userPrompt = `System Context: ${systemInstruction}

Generate one ${difficulty} interview question for a ${params.track} candidate.
${params.weakTopics?.length ? `Focus on these weak topics: ${params.weakTopics.join(', ')}.` : ''}
${params.company ? `Company style: ${params.company}.` : ''}

You must dynamically choose highly relevant, realistic topics for this question. Do not rely on basic examples.

Return JSON exactly in this format:
{
  "text": "The interview question text...",
  "topics": ["Dynamic Topic 1", "Dynamic Topic 2"],
  "difficulty": "${difficulty}"
}`;

  try {
    const result = await model.generateContent(userPrompt);
    const parsed = JSON.parse(result.response.text());

    return {
      text: parsed.text ?? 'Describe your approach to optimizing application architecture.',
      topics: parsed.topics ?? ['Architecture'],
      difficulty: (parsed.difficulty as DifficultyLevel) ?? difficulty,
    };
  } catch (err) {
    console.error('Error generating question from Gemini:', err);
    return {
      text: `[${params.track}] ${params.mode}: Explain a core engineering concept in depth${params.company ? ` (${params.company} bar)` : ''}.`,
      topics: ['General Engineering'],
      difficulty,
    };
  }
}

export async function analyzeAnswer(params: {
  question: string;
  answer: string;
  track: InterviewTrack;
  codeSnippet?: string;
}): Promise<AnalysisOutput> {
  if (!genAI) {
    const scores = calculateScores(params.answer);
    const overall = scores.reduce((s, d) => s + d.score, 0) / scores.length;
    return {
      strengths: ['Clear structure', 'Relevant terminology'],
      gaps: ['Could expand on edge cases', 'Missing performance trade-offs'],
      idealAnswer:
        'A senior answer covers mechanism, trade-offs, real-world examples, and measurable impact.',
      scores,
      overallScore: overall,
      seniorityLevel: mapSeniority(overall),
      hiringSignal: mapHiringSignal(overall),
      followUpQuestions: ['How would you measure improvement?', 'What breaks at scale?'],
      coachingAdvice: ['Use STAR for behavioural parts', 'Lead with trade-offs before implementation'],
      behaviouralNotes: 'Communicates confidently with room for deeper technical rigor.',
      markdownResponse: 'AI Analysis failed, falling back to heuristic evaluation.',
    };
  }

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: 'application/json' },
  });

  const userPrompt = `You are a principal ${params.track} interviewer analyzing a candidate's answer.
Question: ${params.question}
Answer: ${params.answer}
Code Snippet: ${params.codeSnippet ?? 'none'}

Analyze the candidate's answer. Return JSON only, exactly in this format:
{
  "strengths": ["...", "..."],
  "gaps": ["...", "..."],
  "idealAnswer": "...",
  "scores": [
    { "name": "Technical Accuracy", "score": 8 },
    { "name": "Depth of Knowledge", "score": 7 },
    { "name": "Practical Application", "score": 9 },
    { "name": "Communication Clarity", "score": 8 },
    { "name": "Problem Solving", "score": 7 },
    { "name": "Senior-Level Thinking", "score": 6 }
  ],
  "overallScore": 7.5,
  "followUpQuestions": ["...", "..."],
  "coachingAdvice": ["...", "..."],
  "behaviouralNotes": "...",
  "markdownResponse": "A fully formulated, conversational markdown string containing your detailed analysis, scores, strengths, gaps, and follow-ups. Do not just use a rigid template. Make it feel like an AI mentor speaking to the candidate."
}`;

  try {
    const result = await model.generateContent(userPrompt);
    const raw = JSON.parse(result.response.text());

    const scores = Array.isArray(raw.scores)
      ? raw.scores.map((s: any) => ({
          name: s.name,
          score: Number(s.score),
          maxScore: 10,
        }))
      : calculateScores(params.answer);

    const overall =
      Number(raw.overallScore) ||
      scores.reduce((sum: number, d: { score: number }) => sum + d.score, 0) / scores.length;

    return {
      strengths: raw.strengths ?? [],
      gaps: raw.gaps ?? [],
      idealAnswer: raw.idealAnswer ?? '',
      scores,
      overallScore: overall,
      seniorityLevel: mapSeniority(overall),
      hiringSignal: mapHiringSignal(overall),
      followUpQuestions: raw.followUpQuestions ?? [],
      coachingAdvice: raw.coachingAdvice ?? [],
      behaviouralNotes: raw.behaviouralNotes,
      markdownResponse: raw.markdownResponse ?? 'Analysis complete. Good job!',
    };
  } catch (err) {
    console.error('Error analyzing answer from Gemini:', err);
    const scores = calculateScores(params.answer);
    const overall = scores.reduce((s, d) => s + d.score, 0) / scores.length;
    return {
      strengths: ['AI Analysis failed, falling back to heuristic evaluation'],
      gaps: [],
      idealAnswer: 'Please try again later.',
      scores,
      overallScore: overall,
      seniorityLevel: mapSeniority(overall),
      hiringSignal: mapHiringSignal(overall),
      followUpQuestions: [],
      coachingAdvice: [],
      behaviouralNotes: 'N/A',
      markdownResponse: 'AI Analysis failed, falling back to heuristic evaluation.',
    };
  }
}

export async function streamInterviewerReply(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  onChunk: (text: string) => void
): Promise<string> {
  if (!genAI) {
    const reply = 'Thanks for your answer. I will analyze it and share detailed feedback.';
    onChunk(reply);
    return reply;
  }

  const systemMessages = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
    .join('\n');

  const streamModel = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemMessages || undefined,
  });

  const chatMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  if (chatMessages.length === 0) {
    return '';
  }

  try {
    const history = chatMessages.slice(0, -1);
    const latestMessage = chatMessages[chatMessages.length - 1].parts[0].text;

    const chat = streamModel.startChat({ history });
    const result = await chat.sendMessageStream(latestMessage);

    let full = '';
    for await (const chunk of result.stream) {
      const delta = chunk.text();
      full += delta;
      if (delta) onChunk(delta);
    }
    return full;
  } catch (err) {
    console.error('Error streaming reply from Gemini:', err);
    const reply = 'I am currently experiencing issues connecting to my AI backend.';
    onChunk(reply);
    return reply;
  }
}
