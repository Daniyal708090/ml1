'use client';

import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 px-4 py-3 text-sm text-white/50"
    >
      <span className="sr-only">AI is typing</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-violet-400"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
        />
      ))}
      <span>Interviewer is thinking...</span>
    </motion.div>
  );
}
