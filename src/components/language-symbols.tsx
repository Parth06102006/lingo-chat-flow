'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Language symbols - first letters from different languages
const LANGUAGE_SYMBOLS = [
  { symbol: 'A', label: 'English' },
  { symbol: '中', label: 'Chinese' },
  { symbol: 'Ж', label: 'Russian' },
  { symbol: 'ع', label: 'Arabic' },
  { symbol: 'א', label: 'Hebrew' },
  { symbol: '日', label: 'Japanese' },
  { symbol: 'Α', label: 'Greek' },
  { symbol: 'Ş', label: 'Turkish' },
  { symbol: 'फ', label: 'Hindi' },
  { symbol: '가', label: 'Korean' },
  { symbol: 'Đ', label: 'Vietnamese' },
  { symbol: 'Ж', label: 'Bulgarian' },
];

interface SymbolPosition {
  id: number;
  symbol: string;
  rotation: number;
  x: string;
  y: string;
  delay: number;
  duration: number;
  opacity: number;
}

export default function LanguageSymbols() {
  const [symbols, setSymbols] = useState<SymbolPosition[]>([]);

  useEffect(() => {
    const positions: SymbolPosition[] = [
      // Top-left corner area
      { id: 1, symbol: '中', rotation: -25, x: '8%', y: '12%', delay: 0, duration: 20, opacity: 0.6 },
      { id: 2, symbol: 'ع', rotation: 45, x: '15%', y: '8%', delay: 0.5, duration: 24, opacity: 0.5 },
      
      // Near title area
      { id: 3, symbol: 'Ж', rotation: -15, x: '85%', y: '18%', delay: 1, duration: 22, opacity: 0.4 },
      { id: 4, symbol: 'א', rotation: 30, x: '88%', y: '28%', delay: 1.5, duration: 25, opacity: 0.5 },
      
      // Middle-left area
      { id: 5, symbol: '日', rotation: 60, x: '5%', y: '42%', delay: 2, duration: 26, opacity: 0.4 },
      { id: 6, symbol: 'Α', rotation: -35, x: '6%', y: '52%', delay: 2.5, duration: 23, opacity: 0.5 },
      
      // Middle-right area
      { id: 7, symbol: 'Ş', rotation: 20, x: '92%', y: '48%', delay: 3, duration: 24, opacity: 0.4 },
      { id: 8, symbol: 'फ', rotation: -40, x: '90%', y: '60%', delay: 3.5, duration: 25, opacity: 0.5 },
      
      // Bottom area
      { id: 9, symbol: '가', rotation: 15, x: '12%', y: '78%', delay: 4, duration: 22, opacity: 0.5 },
      { id: 10, symbol: 'Đ', rotation: -20, x: '82%', y: '82%', delay: 4.5, duration: 24, opacity: 0.4 },
    ];

    setSymbols(positions);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {symbols.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-5xl font-bold"
          style={{
            left: item.x,
            top: item.y,
            opacity: item.opacity,
            color: '#2563eb', // Blue color matching the theme
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: item.opacity,
            scale: 1,
            rotate: item.rotation,
            y: [0, -20, 0],
          }}
          transition={{
            opacity: { delay: item.delay, duration: 0.6 },
            scale: { delay: item.delay, duration: 0.6 },
            rotate: { delay: item.delay, duration: 0.6 },
            y: {
              delay: item.delay + 0.6,
              duration: item.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          whileHover={{ scale: 1.15, rotate: item.rotation + 10 }}
        >
          {item.symbol}
        </motion.div>
      ))}
    </div>
  );
}
