import { motion } from 'framer-motion';
import { Calendar, Clock, IndianRupee, MapPin, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Lecture } from '@/services/lectures';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LectureCardProps {
  lecture: Lecture;
  defaultPrice?: number | null;
  index: number;
  onBook: (lecture: Lecture) => void;
}

function formatRupees(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

const LectureCard = ({ lecture, defaultPrice, index, onBook }: LectureCardProps) => {
  const isFull = lecture.seats_available === 0;
  const seatsLow = lecture.seats_available > 0 && lecture.seats_available <= 5;
  const lecturePrice = lecture.price_inr ?? defaultPrice ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-elevated"
    >
      {/* Category bar */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <Badge variant="secondary" className="font-body text-xs font-medium">
          {lecture.category}
        </Badge>
        {isFull && (
          <Badge variant="destructive" className="font-body text-xs">Fully Booked</Badge>
        )}
        {seatsLow && (
          <Badge className="bg-accent text-accent-foreground font-body text-xs">
            {lecture.seats_available} seats left
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-xl font-semibold text-card-foreground leading-snug">
          {lecture.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {lecture.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-primary" />
            {format(parseISO(lecture.date), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-primary" />
            {lecture.time} · {lecture.duration_minutes}min
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-primary" />
            {lecture.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={14} className="text-primary" />
            {lecture.seats_available}/{lecture.total_seats} available
          </span>
          {lecturePrice && (
            <span className="flex items-center gap-1.5">
              <IndianRupee size={14} className="text-primary" />
              INR {formatRupees(lecturePrice)}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-border px-5 py-4">
        <Button
          onClick={() => onBook(lecture)}
          disabled={isFull}
          className="w-full font-body font-semibold"
          size="lg"
        >
          {isFull ? 'Join Waitlist' : 'Book Now'}
        </Button>
      </div>
    </motion.div>
  );
};

export default LectureCard;
