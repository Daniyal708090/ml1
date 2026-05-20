'use client';

import { useState, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AudioInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function AudioInputButton({ onTranscript, className }: AudioInputButtonProps) {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);

  const toggle = useCallback(() => {
    const SpeechRecognitionCtor = getSpeechRecognition();

    if (!SpeechRecognitionCtor) {
      onTranscript('[Voice input requires Chrome or Edge]');
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setProcessing(true);
      onTranscript(transcript);
      setProcessing(false);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  }, [listening, onTranscript]);

  return (
    <Button
      type="button"
      variant={listening ? 'danger' : 'secondary'}
      size="sm"
      onClick={toggle}
      className={cn(className)}
      title="Voice interview mode"
    >
      {processing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : listening ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
