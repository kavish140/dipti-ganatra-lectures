import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const HeroSection = () => (
  <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-primary pt-16">
    {/* Decorative circles */}
    <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-foreground/5" />
    <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-foreground/5" />

    <div className="container relative z-10 flex flex-col items-center text-center">
      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-4 rounded-full border border-primary-foreground/20 px-4 py-1.5 text-xs font-medium tracking-wide text-primary-foreground/80"
      >
        MEDICAL EDUCATION PLATFORM
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="max-w-3xl font-heading text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl lg:text-6xl"
      >
        Expert Medical Lectures by{' '}
        <span className="italic">Dr. Dipti Ganatra</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 max-w-xl text-base leading-relaxed text-primary-foreground/75 sm:text-lg"
      >
        Join evidence-based lectures in dermatology, aesthetic medicine, and wellness. Designed for medical professionals seeking continuing education.
      </motion.p>

      <motion.a
        href="#lectures"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="mt-8 rounded-lg bg-primary-foreground px-8 py-3 text-sm font-semibold text-primary shadow-lg transition-transform hover:scale-105"
      >
        Browse Upcoming Lectures
      </motion.a>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10"
      >
        <ArrowDown size={20} className="animate-bounce text-primary-foreground/50" />
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
