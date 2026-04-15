import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import LectureCard from '@/components/LectureCard';
import BookingModal from '@/components/BookingModal';
import { fetchLectures, type Lecture } from '@/services/lectures';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);

  const { data: lectures, isLoading } = useQuery({
    queryKey: ['lectures'],
    queryFn: fetchLectures,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />

      {/* Lectures Section */}
      <section id="lectures" className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Upcoming Schedule
            </span>
            <h2 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Upcoming Lectures
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              Reserve your seat for our next educational session. Lectures are available both in-person and virtually.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4 rounded-xl border border-border p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lectures?.map((lecture, i) => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  index={i}
                  onBook={setSelectedLecture}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-t border-border bg-secondary/50 py-20">
        <div className="container max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">About</span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground">Dr. Dipti Ganatra</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            An accomplished medical professional specializing in dermatology and aesthetic medicine, Dr. Dipti Ganatra is passionate about advancing medical education. Through these curated lectures, she shares evidence-based insights, practical clinical skills, and the latest research with fellow practitioners and students.
          </p>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contact" className="border-t border-border py-12">
        <div className="container flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            For inquiries, reach out at{' '}
            <a href="mailto:lectures@drdiptiganatra.com" className="font-medium text-primary underline-offset-4 hover:underline">
              lectures@drdiptiganatra.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Dr. Dipti Ganatra · meet.drdiptiganatra.com
          </p>
        </div>
      </footer>

      <BookingModal
        lecture={selectedLecture}
        open={!!selectedLecture}
        onClose={() => setSelectedLecture(null)}
      />
    </div>
  );
};

export default Index;
