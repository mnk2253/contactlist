export interface Member {
  id: string;
  name: string;
  phone: string;
  profession: string;
  image_url: string;
  blood_group?: string;
  date_of_birth?: string;
  created_at: string;
  is_approved: boolean;
}

export interface LifeEvent {
  id: string;
  name: string;
  type: 'marriage' | 'death';
  date: string;
  image_url: string;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  is_published: boolean;
  created_at: string;
}
