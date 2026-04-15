import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Clock3, IndianRupee, LogOut, Plus, Trash2, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  createLecture,
  deleteLecture,
  fetchGlobalLecturePrice,
  fetchLectures,
  type LectureInput,
  updateGlobalLecturePrice,
} from '@/services/lectures';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const ADMIN_AUTH_KEY = 'dg_meet_admin_authenticated';

interface LectureFormState {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  category: string;
  speaker: string;
  location: string;
  totalSeats: string;
  seatsAvailable: string;
  priceInr: string;
}

const initialForm: LectureFormState = {
  title: '',
  description: '',
  date: '',
  time: '',
  duration: '60',
  category: 'General',
  speaker: 'Dr. Dipti Ganatra',
  location: 'Online',
  totalSeats: '30',
  seatsAvailable: '30',
  priceInr: '',
};

function formatRupees(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

const Admin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });
  const [form, setForm] = useState<LectureFormState>(initialForm);
  const [priceDraft, setPriceDraft] = useState('');

  const { data: lectures = [], isLoading: loadingLectures } = useQuery({
    queryKey: ['lectures'],
    queryFn: fetchLectures,
    enabled: isAuthenticated,
  });

  const { data: globalPrice, isLoading: loadingPrice } = useQuery({
    queryKey: ['globalLecturePrice'],
    queryFn: fetchGlobalLecturePrice,
    enabled: isAuthenticated,
  });

  const visibleLectures = useMemo(
    () => [...lectures].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    [lectures],
  );

  const createLectureMutation = useMutation({
    mutationFn: createLecture,
    onSuccess: (result) => {
      if (!result.success) {
        toast({
          title: 'Could not create lecture',
          description: result.error || 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
      toast({ title: 'Lecture created', description: 'Lecture is now visible on the main site.' });
    },
  });

  const deleteLectureMutation = useMutation({
    mutationFn: deleteLecture,
    onSuccess: (result) => {
      if (!result.success) {
        toast({
          title: 'Delete failed',
          description: result.error || 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['lectures'] });
      toast({ title: 'Lecture removed' });
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: updateGlobalLecturePrice,
    onSuccess: (result) => {
      if (!result.success) {
        toast({
          title: 'Price update failed on Supabase',
          description: 'Saved locally in this browser. Check site_settings table/policies in Supabase.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Global price updated' });
      }

      queryClient.invalidateQueries({ queryKey: ['globalLecturePrice'] });
      setPriceDraft('');
    },
  });

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();

    if (!ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      window.localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      toast({
        title: 'Admin mode enabled',
        description: 'Set VITE_ADMIN_PASSWORD in env to require password protection.',
      });
      return;
    }

    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      window.localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setPasswordInput('');
      return;
    }

    toast({ title: 'Invalid password', variant: 'destructive' });
  };

  const handleLogout = () => {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
  };

  const handleCreateLecture = (event: FormEvent) => {
    event.preventDefault();

    const totalSeats = Number(form.totalSeats);
    const seatsAvailable = Number(form.seatsAvailable);
    const duration = Number(form.duration);

    if (!form.title || !form.date || !form.time || !form.description) {
      toast({
        title: 'Missing details',
        description: 'Title, description, date and time are required.',
        variant: 'destructive',
      });
      return;
    }

    if (!Number.isFinite(totalSeats) || totalSeats <= 0) {
      toast({ title: 'Invalid total seats', variant: 'destructive' });
      return;
    }

    if (!Number.isFinite(seatsAvailable) || seatsAvailable < 0 || seatsAvailable > totalSeats) {
      toast({ title: 'Invalid available seats', variant: 'destructive' });
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      toast({ title: 'Invalid duration', variant: 'destructive' });
      return;
    }

    const payload: LectureInput = {
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      duration_minutes: duration,
      category: form.category,
      speaker: form.speaker,
      location: form.location,
      total_seats: totalSeats,
      seats_available: seatsAvailable,
      price_inr: form.priceInr ? Number(form.priceInr) : null,
    };

    createLectureMutation.mutate(payload);
  };

  const saveGlobalPrice = () => {
    const price = Number(priceDraft);

    if (!Number.isFinite(price) || price <= 0) {
      toast({ title: 'Enter a valid price', variant: 'destructive' });
      return;
    }

    updatePriceMutation.mutate(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-heading">Admin Access</CardTitle>
            <CardDescription>
              Sign in to manage lecture schedule and pricing for meet.drdiptiganatra.com.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  placeholder="Enter admin password"
                />
              </div>
              <Button type="submit" className="w-full">Continue</Button>
              {!ADMIN_PASSWORD && (
                <p className="text-xs text-muted-foreground">
                  VITE_ADMIN_PASSWORD is not set. Login is open for local/dev usage.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40 py-8">
      <div className="container space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Lecture Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Control lectures and pricing for meet.drdiptiganatra.com.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/">Back to site</Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Global Price Setting</CardTitle>
            <CardDescription>
              This amount is shown on lecture cards where a lecture-specific price is not set.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full max-w-xs space-y-2">
                <Label htmlFor="global-price">Price (INR)</Label>
                <Input
                  id="global-price"
                  type="number"
                  min={1}
                  value={priceDraft}
                  onChange={(event) => setPriceDraft(event.target.value)}
                  placeholder={globalPrice ? String(globalPrice) : '1499'}
                />
              </div>
              <Button onClick={saveGlobalPrice} disabled={updatePriceMutation.isPending}>
                <IndianRupee className="mr-2 h-4 w-4" />
                Save Price
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Current global price:{' '}
              <span className="font-semibold text-foreground">
                {loadingPrice
                  ? 'Loading...'
                  : globalPrice
                    ? `INR ${formatRupees(globalPrice)}`
                    : 'Not configured'}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Create Lecture</CardTitle>
            <CardDescription>Add a new lecture to the public schedule.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLecture} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  value={form.time}
                  onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
                  placeholder="7:00 PM"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="speaker">Speaker</Label>
                <Input
                  id="speaker"
                  value={form.speaker}
                  onChange={(event) => setForm((prev) => ({ ...prev, speaker: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-seats">Total Seats</Label>
                <Input
                  id="total-seats"
                  type="number"
                  min={1}
                  value={form.totalSeats}
                  onChange={(event) => setForm((prev) => ({ ...prev, totalSeats: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="available-seats">Available Seats</Label>
                <Input
                  id="available-seats"
                  type="number"
                  min={0}
                  value={form.seatsAvailable}
                  onChange={(event) => setForm((prev) => ({ ...prev, seatsAvailable: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lecture-price">Lecture Price (INR, optional)</Label>
                <Input
                  id="lecture-price"
                  type="number"
                  min={1}
                  value={form.priceInr}
                  onChange={(event) => setForm((prev) => ({ ...prev, priceInr: event.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={createLectureMutation.isPending}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lecture
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Scheduled Lectures</CardTitle>
            <CardDescription>Review and remove lecture entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLectures ? (
              <p className="text-sm text-muted-foreground">Loading lectures...</p>
            ) : visibleLectures.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lectures available yet.</p>
            ) : (
              <div className="space-y-3">
                {visibleLectures.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="flex flex-col gap-3 rounded-lg border bg-background p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{lecture.title}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(parseISO(lecture.date), 'dd MMM yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          {lecture.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {lecture.seats_available}/{lecture.total_seats} seats
                        </span>
                        {(lecture.price_inr || globalPrice) && (
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5" />
                            INR {formatRupees(lecture.price_inr || globalPrice || 0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => deleteLectureMutation.mutate(lecture.id)}
                      disabled={deleteLectureMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
