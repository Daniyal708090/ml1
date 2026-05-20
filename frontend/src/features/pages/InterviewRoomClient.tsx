'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { frontendQuestions } from '@/lib/mockData';
import { formatTime } from '@/lib/utils';
import type { Message, InterviewMode, InterviewTrack } from '@/lib/types';
import { CodeEditor } from '@/components/interview/CodeEditor';
import { AudioInputButton } from '@/components/interview/AudioInputButton';
import { TypingIndicator } from '@/components/interview/TypingIndicator';
import { CompanySelector } from '@/components/interview/CompanySelector';
import { api } from '@/lib/api';
import { toApiMode, toApiTrack } from '@/lib/mappers';

const MODES: { id: InterviewMode; label: string }[] = [
  { id: 'practice', label: 'Practice' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'question-bank', label: 'Question Bank' },
  { id: 'deep-dive', label: 'Deep Dive' },
  { id: 'weak-spot', label: 'Weak Spot' },
  { id: 'dream-job', label: 'Dream Job' },
];

const TRACKS: { id: InterviewTrack; label: string }[] = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'fullstack', label: 'Full-Stack' },
];

export function InterviewRoomClient() {
  const router = useRouter();
  const [track, setTrack] = useState<InterviewTrack>('frontend');
  const [mode, setMode] = useState<InterviewMode>('practice');
  const [companyId, setCompanyId] = useState<string>();
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState('// Optional code snippet\n');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function startInterview() {
    setStarted(true);
    try {
      const res = (await api.interviews.start({
        track: toApiTrack(track),
        mode: toApiMode(mode),
        companySimulationId: companyId,
      })) as { interview: { id: string }; message: { content: string } };
      setInterviewId(res.interview.id);
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: res.message.content,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hello! I'm your AI interviewer (${track} / ${mode}).\n\n**${frontendQuestions[0].text}**`,
          timestamp: new Date(),
        },
      ]);
    }
  }

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const answerText = input;
    setInput('');
    setIsTyping(true);

    try {
      if (interviewId) {
        const result = (await api.interviews.answer(interviewId, {
          content: answerText,
          codeSnippet: showCode ? code : undefined,
        })) as { analysis: { markdownResponse: string }; nextQuestion: { text: string } };
        
        const analysisMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.analysis.markdownResponse || 'Analysis complete.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, analysisMessage]);
        setIsTyping(false);

        if (currentQuestion < frontendQuestions.length - 1) {
          const next = currentQuestion + 1;
          setCurrentQuestion(next);
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `**Next question:**\n\n${result.nextQuestion.text}`,
                timestamp: new Date(),
              },
            ]);
          }, 1200);
        } else {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 3).toString(),
                role: 'assistant',
                content: 'Interview complete! View your full analysis report.',
                timestamp: new Date(),
              },
            ]);
          }, 1200);
        }
      }
    } catch (error) {
      console.error('Failed to get answer analysis:', error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 4).toString(),
          role: 'assistant',
          content: 'I encountered an error analyzing your answer. Let\'s proceed.',
          timestamp: new Date(),
        },
      ]);
    }
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Configure Interview</h1>
        <Card glass className="space-y-6">
          <div>
            <p className="mb-2 text-sm text-white/60">Track</p>
            <div className="flex flex-wrap gap-2">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTrack(t.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    track === t.id ? 'border-violet-500/50 bg-violet-500/20' : 'border-white/10'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-white/60">Mode</p>
            <div className="flex flex-wrap gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    mode === m.id ? 'border-violet-500/50 bg-violet-500/20' : 'border-white/10'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <CompanySelector value={companyId} onChange={setCompanyId} />
          <Button onClick={startInterview} className="w-full">
            Start Interview
          </Button>
        </Card>
      </div>
    );
  }

  const q = frontendQuestions[currentQuestion];

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-5xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Interview Room</h1>
          <p className="text-sm text-white/50">
            Question {currentQuestion + 1} of {frontendQuestions.length}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{track}</Badge>
          <Badge variant="info">{mode}</Badge>
          <Badge variant="warning">{q?.difficulty}</Badge>
        </div>
      </div>

      <Card glass className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  className={`prose-interview max-w-[85%] rounded-xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-violet-600/30 text-white'
                      : 'border border-white/10 bg-white/5'
                  }`}
                >
                  <div className="mb-1 text-xs text-white/40">{formatTime(msg.timestamp)}</div>
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {showCode && (
          <div className="border-t border-white/10 p-4">
            <CodeEditor value={code} onChange={setCode} />
          </div>
        )}

        <div className="flex gap-2 border-t border-white/10 p-4">
          <AudioInputButton onTranscript={(t) => setInput((prev) => (prev ? `${prev} ${t}` : t))} />
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowCode(!showCode)} title="Code editor (Ctrl+E)">
            <Code2 className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type your answer... (Enter to send)"
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isTyping || !input.trim()}>
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={() => router.push('/dashboard')}>
          Exit
        </Button>
        <Button variant="secondary" onClick={() => router.push('/results')}>
          View Results
        </Button>
      </div>
    </div>
  );
}


