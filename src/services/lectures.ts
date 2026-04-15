import { supabase } from '@/lib/supabase';

export interface Lecture {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration_minutes: number;
  speaker: string;
  category: string;
  seats_available: number;
  total_seats: number;
  location: string;
  image_url?: string;
  price_inr?: number | null;
  is_live?: boolean;
  meeting_room?: string | null;
  live_started_at?: string | null;
}

export interface LectureInput {
  title: string;
  description: string;
  date: string;
  time: string;
  duration_minutes: number;
  speaker: string;
  category: string;
  seats_available: number;
  total_seats: number;
  location: string;
  image_url?: string;
  price_inr?: number | null;
  is_live?: boolean;
  meeting_room?: string | null;
  live_started_at?: string | null;
}

// Mock data for development / when Supabase isn't connected
const mockLectures: Lecture[] = [
  {
    id: '1',
    title: 'Advances in Dermatological Procedures',
    description: 'Explore the latest minimally invasive techniques in modern dermatology, including laser therapies, chemical peels, and regenerative medicine approaches.',
    date: '2026-05-10',
    time: '10:00 AM',
    duration_minutes: 90,
    speaker: 'Dr. Dipti Ganatra',
    category: 'Dermatology',
    seats_available: 18,
    total_seats: 30,
    location: 'Virtual — Zoom',
    price_inr: 1499,
    is_live: false,
    meeting_room: null,
    live_started_at: null,
  },
  {
    id: '2',
    title: 'Aesthetic Medicine: Evidence-Based Approaches',
    description: 'A comprehensive review of evidence-based aesthetic treatments, focusing on patient safety, outcome optimization, and the latest clinical guidelines.',
    date: '2026-05-17',
    time: '2:00 PM',
    duration_minutes: 60,
    speaker: 'Dr. Dipti Ganatra',
    category: 'Aesthetic Medicine',
    seats_available: 5,
    total_seats: 25,
    location: 'Mumbai Medical Center',
    price_inr: 1999,
    is_live: false,
    meeting_room: null,
    live_started_at: null,
  },
  {
    id: '3',
    title: 'Skin Health & Nutrition Masterclass',
    description: 'Understanding the critical link between nutrition, gut health, and skin conditions. Learn practical dietary interventions for common dermatological issues.',
    date: '2026-05-24',
    time: '11:00 AM',
    duration_minutes: 120,
    speaker: 'Dr. Dipti Ganatra',
    category: 'Wellness',
    seats_available: 22,
    total_seats: 40,
    location: 'Virtual — Zoom',
    price_inr: 1299,
    is_live: false,
    meeting_room: null,
    live_started_at: null,
  },
  {
    id: '4',
    title: 'Hair Restoration Techniques Workshop',
    description: 'Hands-on workshop covering PRP therapy, mesotherapy, and the latest advancements in non-surgical hair restoration for medical professionals.',
    date: '2026-06-07',
    time: '9:00 AM',
    duration_minutes: 180,
    speaker: 'Dr. Dipti Ganatra',
    category: 'Workshop',
    seats_available: 0,
    total_seats: 15,
    location: 'Mumbai Medical Center',
    price_inr: 2499,
    is_live: false,
    meeting_room: null,
    live_started_at: null,
  },
];

const LOCAL_PRICE_KEY = 'dg_global_lecture_price_inr';
let localLectureStore: Lecture[] = [...mockLectures];

function getLocalPrice(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(LOCAL_PRICE_KEY);
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function setLocalPrice(price: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_PRICE_KEY, String(price));
}

function safeRoomToken(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function getOrCreateRoomName(lecture: Lecture): string {
  if (lecture.meeting_room) {
    return lecture.meeting_room;
  }

  const base = safeRoomToken(lecture.title || lecture.id);
  const tail = safeRoomToken(lecture.id).slice(0, 10) || 'session';
  return `dipti-${base || 'lecture'}-${tail}`;
}

export async function fetchLectures(): Promise<Lecture[]> {
  if (!supabase) {
    return localLectureStore;
  }

  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching lectures:', error);
    return localLectureStore;
  }

  return data as Lecture[];
}

export async function createLecture(input: LectureInput): Promise<{ success: boolean; lecture?: Lecture; error?: string }> {
  if (!supabase) {
    const lecture: Lecture = {
      id: crypto.randomUUID(),
      is_live: false,
      meeting_room: null,
      live_started_at: null,
      ...input,
    };
    localLectureStore = [...localLectureStore, lecture];
    return { success: true, lecture };
  }

  const { data, error } = await supabase
    .from('lectures')
    .insert(input)
    .select('*')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, lecture: data as Lecture };
}

export async function deleteLecture(lectureId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    localLectureStore = localLectureStore.filter((lecture) => lecture.id !== lectureId);
    return { success: true };
  }

  const { error } = await supabase
    .from('lectures')
    .delete()
    .eq('id', lectureId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function fetchLectureById(lectureId: string): Promise<Lecture | null> {
  if (!supabase) {
    return localLectureStore.find((lecture) => lecture.id === lectureId) || null;
  }

  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .eq('id', lectureId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching lecture:', error);
    return null;
  }

  return (data as Lecture) || null;
}

export async function startLectureLive(lectureId: string): Promise<{ success: boolean; lecture?: Lecture; error?: string }> {
  if (!supabase) {
    const lecture = localLectureStore.find((item) => item.id === lectureId);
    if (!lecture) {
      return { success: false, error: 'Lecture not found.' };
    }

    const room = getOrCreateRoomName(lecture);
    const updated: Lecture = {
      ...lecture,
      is_live: true,
      meeting_room: room,
      live_started_at: new Date().toISOString(),
    };

    localLectureStore = localLectureStore.map((item) => (item.id === lectureId ? updated : item));
    return { success: true, lecture: updated };
  }

  const { data: existing, error: readError } = await supabase
    .from('lectures')
    .select('*')
    .eq('id', lectureId)
    .maybeSingle();

  if (readError || !existing) {
    return { success: false, error: readError?.message || 'Lecture not found.' };
  }

  const existingLecture = existing as Lecture;
  const room = getOrCreateRoomName(existingLecture);

  const { data, error } = await supabase
    .from('lectures')
    .update({
      is_live: true,
      meeting_room: room,
      live_started_at: new Date().toISOString(),
    })
    .eq('id', lectureId)
    .select('*')
    .single();

  if (error) {
    return {
      success: false,
      error: `${error.message}. Ensure lectures table has is_live, meeting_room, and live_started_at columns.`,
    };
  }

  return { success: true, lecture: data as Lecture };
}

export async function stopLectureLive(lectureId: string): Promise<{ success: boolean; lecture?: Lecture; error?: string }> {
  if (!supabase) {
    const lecture = localLectureStore.find((item) => item.id === lectureId);
    if (!lecture) {
      return { success: false, error: 'Lecture not found.' };
    }

    const updated: Lecture = {
      ...lecture,
      is_live: false,
    };
    localLectureStore = localLectureStore.map((item) => (item.id === lectureId ? updated : item));
    return { success: true, lecture: updated };
  }

  const { data, error } = await supabase
    .from('lectures')
    .update({ is_live: false })
    .eq('id', lectureId)
    .select('*')
    .single();

  if (error) {
    return {
      success: false,
      error: `${error.message}. Ensure lectures table has is_live column.`,
    };
  }

  return { success: true, lecture: data as Lecture };
}

export async function fetchGlobalLecturePrice(): Promise<number | null> {
  if (!supabase) {
    return getLocalPrice();
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'global_lecture_price_inr')
    .maybeSingle();

  if (error) {
    console.error('Error fetching global lecture price:', error);
    return getLocalPrice();
  }

  if (!data?.value) {
    return getLocalPrice();
  }

  const parsed = Number(data.value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function updateGlobalLecturePrice(price: number): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    setLocalPrice(price);
    return { success: true };
  }

  const { error } = await supabase
    .from('site_settings')
    .upsert(
      {
        key: 'global_lecture_price_inr',
        value: String(price),
      },
      { onConflict: 'key' },
    );

  if (error) {
    console.error('Error updating global lecture price:', error);
    setLocalPrice(price);
    return { success: false, error: error.message };
  }

  setLocalPrice(price);
  return { success: true };
}

export async function submitBooking(lectureId: string, attendee: {
  name: string;
  email: string;
  phone?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    // Mock success
    return { success: true };
  }

  const { error } = await supabase.from('bookings').insert({
    lecture_id: lectureId,
    attendee_name: attendee.name,
    attendee_email: attendee.email,
    attendee_phone: attendee.phone,
    status: 'confirmed',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
