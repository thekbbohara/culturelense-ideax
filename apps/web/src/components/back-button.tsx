// 'use client';

// import Link from 'next/link';
// import { ArrowLeft } from 'lucide-react';
// import { motion } from 'framer-motion';

// export function BackButton({ href }: { href: string }) {
//     return (
//         <Link href="/scan" className="pointer-events-auto">
//             <motion.button
//                 className="relative flex items-center overflow-hidden rounded-full border border-white/10 bg-black/20 backdrop-blur-xl"
//                 initial="initial"
//                 whileHover="hover"
//                 whileTap="tap"
//                 layout // Helps maintain smoothness during width changes
//             >
//                 {/* Animated Background Fill Layer */}
//                 <motion.div
//                     className="absolute inset-0 bg-primary"
//                     variants={{
//                         initial: { opacity: 0 },
//                         hover: { opacity: 1 },
//                     }}
//                     transition={{ duration: 0.3 }}
//                 />

//                 {/* Icon Container */}
//                 <div className="relative z-10 p-2">
//                     <motion.div
//                         className="flex items-center justify-center rounded-full bg-white/10 p-2"
//                         variants={{
//                             initial: { backgroundColor: 'rgba(255,255,255,0.1)', rotate: 0 },
//                             hover: { backgroundColor: 'rgba(255,255,255,0.2)', rotate: -45 },
//                         }}
//                         transition={{ type: 'spring', stiffness: 300, damping: 15 }}
//                     >
//                         <ArrowLeft className="h-5 w-5 text-white" />
//                     </motion.div>
//                 </div>

//                 {/* Text Container (Reveals on Hover) */}
//                 <motion.div
//                     className="relative z-10 flex items-center overflow-hidden whitespace-nowrap"
//                     variants={{
//                         initial: { width: 0, opacity: 0 },
//                         hover: { width: 'auto', opacity: 1 },
//                     }}
//                     transition={{ type: 'spring', stiffness: 300, damping: 20 }}
//                 >
//                     <motion.span
//                         className="pr-5 text-sm font-medium tracking-wide text-white"
//                         variants={{
//                             initial: { x: -10 },
//                             hover: { x: 0 }
//                         }}
//                         transition={{ duration: 0.2 }}
//                     >
//                         BACK
//                     </motion.span>
//                 </motion.div>
//             </motion.button>
//         </Link>
//     );
// }


'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

type Direction = 'left' | 'right';

interface BackButtonProps {
    href: string;
    text?: string;
    icon?: ReactNode;
    direction?: Direction;
    className?: string;
}

export function BackButton({
    href,
    text = 'Back',
    icon,
    direction = 'left',
    className = '',
}: BackButtonProps) {
    const isLeft = direction === 'left';

    return (
        <Link href={href} className="pointer-events-auto">
            <motion.button
                type="button"
                className={`relative flex items-center overflow-hidden rounded-full border border-white/10 bg-black/20 backdrop-blur-xl ${className}`}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                layout
            >
                {/* Hover background */}
                <motion.div
                    className="absolute inset-0 bg-primary"
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
                        {icon ??
                            (isLeft ? (
                                <ArrowLeft className="h-4 w-4 text-white" />
                            ) : (
                                <ArrowRight className="h-4 w-4 text-white" />
                            ))}
                    </motion.div>
                </div>

                {/* Text (reveals on hover) */}
                <motion.div
                    className="relative z-10 flex items-center overflow-hidden whitespace-nowrap"
                    variants={{
                        initial: { width: 0, opacity: 0 },
                        hover: { width: 'auto', opacity: 1 },
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                    <motion.span
                        className={`text-sm font-medium tracking-wide text-white ${isLeft ? 'pl-5' : 'pr-5'
                            }`}
                        variants={{
                            initial: { x: isLeft ? -10 : 10 },
                            hover: { x: 0 },
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        {text}
                    </motion.span>
                </motion.div>
            </motion.button>
        </Link>
    );
}
