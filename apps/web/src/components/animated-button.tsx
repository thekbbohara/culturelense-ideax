'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Direction = 'left' | 'right';

interface AnimatedButtonProps {
  href?: string;
  icon: ReactNode;
  direction?: Direction;
  className?: string;
  onClick?: () => void;
}

export function AnimatedButton({
  href,
  icon,
  direction = 'left',
  className = '',
  onClick,
}: AnimatedButtonProps) {
  const isLeft = direction === 'left';

  const Button = (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative flex items-center rounded-full border border-white/10 bg-black/20 backdrop-blur-xl ${className}`}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
    >
      {/* Hover background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary"
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.25 }}
      />

      {/* Icon */}
      <div className="relative z-10 p-2">
        <motion.div
          className="flex items-center justify-center rounded-full bg-white/10 p-2"
          variants={{
            initial: { rotate: 0 },
            hover: { rotate: isLeft ? -45 : 45 },
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          {icon}
        </motion.div>
      </div>
    </motion.button>
  );

  if (href) {
    return (
      <Link href={href} className="pointer-events-auto">
        {Button}
      </Link>
    );
  }

  return Button;
}
