export interface Member {
  id: string;
  name: string;
  phone: string;
  profession: string;
  image_url: string;
  blood_group?: string;
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
