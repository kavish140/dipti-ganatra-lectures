import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Lecture } from '@/services/lectures';
import { submitBooking } from '@/services/lectures';
import { useToast } from '@/hooks/use-toast';

interface BookingModalProps {
  lecture: Lecture | null;
  open: boolean;
  onClose: () => void;
}

const BookingModal = ({ lecture, open, onClose }: BookingModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  if (!lecture) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await submitBooking(lecture.id, { name, email, phone });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      toast({ title: 'Booking failed', description: result.error, variant: 'destructive' });
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 size={32} className="text-primary" />
            </div>
            <DialogTitle className="font-heading text-2xl">Booking Confirmed!</DialogTitle>
            <p className="text-sm text-muted-foreground">
              You're registered for <strong>{lecture.title}</strong>. A confirmation email will be sent to <strong>{email}</strong>.
            </p>
            <Button onClick={handleClose} className="mt-2 font-body">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{lecture.title}</DialogTitle>
              <DialogDescription className="flex flex-wrap gap-4 pt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar size={13} /> {format(parseISO(lecture.date), 'MMM d, yyyy')}</span>
                <span className="flex items-center gap-1"><Clock size={13} /> {lecture.time}</span>
                <span className="flex items-center gap-1"><MapPin size={13} /> {lecture.location}</span>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-body text-sm">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-body text-sm">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="jane@hospital.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="font-body text-sm">Phone (optional)</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <Button type="submit" disabled={loading} className="mt-2 font-body font-semibold" size="lg">
                {loading ? 'Submitting…' : 'Confirm Booking'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
