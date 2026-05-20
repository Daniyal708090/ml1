'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Monaco = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  className,
}: CodeEditorProps) {
  return (
    <motion.div
      className={cn(
        'overflow-hidden rounded-lg border border-white/10 bg-black/40',
        className
      )}
    >
      <Monaco
        height="220px"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 12 },
        }}
      />
    </motion.div>
  );
}
