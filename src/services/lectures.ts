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
  },
];

export async function fetchLectures(): Promise<Lecture[]> {
  if (!supabase) {
    return mockLectures;
  }

  const { data, error } = await supabase
    .from('lectures')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching lectures:', error);
    return mockLectures;
  }

  return data as Lecture[];
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
