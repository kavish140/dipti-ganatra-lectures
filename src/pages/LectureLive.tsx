import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Video, Monitor, Users, AlertCircle } from 'lucide-react';
import { fetchLectureById } from '@/services/lectures';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DEFAULT_MEET_DOMAIN = 'meet.jit.si';

function sanitizeRoom(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

const LectureLive = () => {
  const { lectureId = '' } = useParams();
  const [searchParams] = useSearchParams();

  const participantName = searchParams.get('name') || 'Guest';
  const role = searchParams.get('role') || 'attendee';
  const meetDomain = DEFAULT_MEET_DOMAIN;

  const { data: lecture, isLoading } = useQuery({
    queryKey: ['lecture', lectureId],
    queryFn: () => fetchLectureById(lectureId),
    enabled: !!lectureId,
    refetchInterval: 10000,
  });

  const roomName = useMemo(() => {
    if (!lecture) {
      return '';
    }

    if (lecture.meeting_room) {
      return sanitizeRoom(lecture.meeting_room);
    }

    return sanitizeRoom(`dipti-lecture-${lecture.id}`);
  }, [lecture]);

  const jitsiUrl = useMemo(() => {
    if (!roomName) {
      return '';
    }

    const encodedName = encodeURIComponent(participantName);
    const hash = '#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false';
    return `https://${meetDomain}/${roomName}?userInfo.displayName=${encodedName}${hash}`;
  }, [meetDomain, participantName, roomName]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
        <p className="text-sm text-muted-foreground">Loading live lecture...</p>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Lecture not found</CardTitle>
            <CardDescription>We could not find this lecture session.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lecture.is_live) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">{lecture.title}</CardTitle>
            <CardDescription>The lecture has not started yet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <AlertCircle className="h-4 w-4" />
                Waiting for doctor to start the live session.
              </p>
              <p className="mt-2">This page refreshes automatically every 10 seconds.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="container flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-heading text-xl font-semibold">{lecture.title}</p>
            <p className="text-xs text-muted-foreground">Live classroom • {role === 'host' ? 'Host mode' : 'Attendee mode'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Exit</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-4">
        <div className="mb-4 grid gap-3 rounded-lg border bg-secondary/40 p-3 text-xs text-muted-foreground md:grid-cols-3">
          <p className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            Enable camera and microphone when prompted.
          </p>
          <p className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            Doctor can share screen using the built-in screen share control.
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Anyone with this live page can join from anywhere in the world.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border bg-black">
          <iframe
            src={jitsiUrl}
            title="Live lecture meeting"
            allow="camera; microphone; display-capture; fullscreen; autoplay"
            className="h-[78vh] w-full"
          />
        </div>
      </main>
    </div>
  );
};

export default LectureLive;
