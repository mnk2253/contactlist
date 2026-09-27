import React, { useRef, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Notice } from '@/src/types';
import { X, Loader2, Check, Upload } from 'lucide-react';

interface NoticeFormProps {
  notice?: Notice;
  isAdmin?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NoticeForm({ notice, isAdmin = false, onSuccess, onCancel }: NoticeFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState(notice?.title || '');
  const [content, setContent] = useState(notice?.content || '');
  const [imageUrl, setImageUrl] = useState(notice?.image_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const extension = file.name.split('.').pop();
      const filePath = `notice-images/${Math.random()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (error: any) {
      console.error('Error uploading notice image:', error);
      alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl || null,
        is_published: notice ? notice.is_published : isAdmin,
      };
      const query = notice
        ? supabase.from('notices').update(data).eq('id', notice.id)
        : supabase.from('notices').insert([data]);
      const { error } = await query;
      if (error) throw error;
      onSuccess();
    } catch (error: any) {
      console.error('Error saving notice:', error);
      alert(`Failed to save notice: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">{notice ? 'Edit Notice' : 'Submit a Notice'}</h2>
          <button onClick={onCancel} className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Notice Image</label>
              <div className="mt-1 flex items-center gap-3">
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-zinc-100">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Notice preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-400"><Upload size={22} /></div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Choose Image'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Notice Title</label>
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                placeholder="Community meeting notice"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Notice Details</label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="mt-1 w-full resize-none rounded-lg border border-zinc-200 px-4 py-2 text-sm focus:border-zinc-900 focus:outline-none"
                placeholder="Write the notice details here..."
              />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {notice ? 'Update' : isAdmin ? 'Publish' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
