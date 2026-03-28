import React, { useState, useRef } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Member } from '@/src/types';
import { X, Upload, Loader2, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MemberFormProps {
  member?: Member;
  isAdmin?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MemberForm({ member, isAdmin = false, onSuccess, onCancel }: MemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(member?.image_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: member?.name || '',
    phone: member?.phone || '',
    profession: member?.profession || '',
    blood_group: member?.blood_group || '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `member-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (error.status === 404 || error.message === 'Bucket not found') {
        alert('Error: Storage bucket "images" not found (404). Please create a public bucket named "images" in your Supabase dashboard or update the code to use your existing bucket name.');
      } else if (error.message?.includes('row-level security')) {
        alert('Error: Permission denied by RLS policy. Please ensure you have added a storage policy in Supabase to allow uploads to the "images" bucket. You can find the SQL to fix this in our recent chat.');
      } else {
        alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        image_url: imageUrl,
        is_approved: member ? member.is_approved : isAdmin,
      };

      if (member) {
        const { error } = await supabase
          .from('members')
          .update(data)
          .eq('id', member.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('members')
          .insert([data]);
        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving member:', error);
      if (error.message?.includes('column "is_approved" of relation "members" does not exist')) {
        alert('Error: The "is_approved" column is missing in your database. Please run the SQL provided in our chat to fix this.');
      } else if (error.message?.includes('column "blood_group" of relation "members" does not exist') || error.message?.includes('blood_group')) {
        alert('Error: The "blood_group" column is missing in your database. Please run the SQL provided in our chat to fix this.');
      } else if (error.message?.includes('row-level security')) {
        alert('Error: Permission denied by RLS policy. Please ensure you have added a policy in Supabase to allow inserts to the "members" table.');
      } else {
        alert(`Failed to save member: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">
            {member ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="group relative h-24 w-24 overflow-hidden rounded-xl bg-zinc-100">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-400">
                    <Upload size={24} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <span className="text-xs font-medium text-white">Change</span>
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              {uploading && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 size={12} className="animate-spin" />
                  Uploading...
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Full Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Profession
              </label>
              <input
                required
                type="text"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                placeholder="Software Engineer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Phone Number
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                placeholder="+1 234 567 890"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Blood Group
              </label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {member ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
