import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Member } from '@/src/types';
import { 
  ArrowLeft, 
  Phone, 
  Briefcase, 
  Calendar, 
  Loader2,
  ExternalLink,
  Share2,
  Check,
  Download,
  Maximize2,
  X,
  Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMember(id);
    }
  }, [id]);

  const fetchMember = async (memberId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', memberId)
        .eq('is_approved', true)
        .single();

      if (error) throw error;
      setMember(data);
    } catch (error) {
      console.error('Error fetching member:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDownloadImage = async () => {
    if (!member?.image_url) return;
    try {
      const response = await fetch(member.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${member.name.replace(/\s+/g, '_')}_profile.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={40} />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-zinc-900">Member not found</h2>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900">
          <ArrowLeft size={20} /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeft size={18} />
            Back to Directory
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            <AnimatePresence mode="wait" initial={false}>
              {shared ? (
                <motion.div key="check" className="flex items-center gap-2 text-emerald-600">
                  <Check size={16} />
                  Copied!
                </motion.div>
              ) : (
                <motion.div key="share" className="flex items-center gap-2">
                  <Share2 size={16} />
                  Share
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
          <div className="h-40 bg-gradient-to-r from-zinc-900 to-zinc-800" />

          <div className="px-6 pb-8">
            <div className="flex flex-col items-center -mt-16">
              <div className="h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-zinc-100 shadow-lg">
                {member.image_url ? (
                  <img src={member.image_url} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-zinc-300">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold text-zinc-900">
                {member.name}
              </h1>
              <p className="text-zinc-500">{member.profession}</p>

              {member.blood_group && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                  <Droplets size={14} />
                  {member.blood_group}
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              
              {/* Contact */}
              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-400">
                  Contact Details
                </h3>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
                    <Phone size={20} />
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">Phone Number</p>
                    <p className="font-semibold text-zinc-900">{member.phone}</p>
                  </div>

                  {/* ✅ CALL NOW BUTTON */}
                  <a
                    href={`tel:${member.phone}`}
                    className="ml-auto inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-green-700 active:scale-95"
                  >
                    <Phone size={16} />
                    Call Now
                  </a>
                </div>
              </div>

              {/* Member Since */}
              <div>
                <h3 className="text-xs font-bold uppercase text-zinc-400">
                  Member Since
                </h3>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
                    <Calendar size={20} />
                  </div>

                  <div>
                    <p className="text-xs text-zinc-400">Joined On</p>
                    <p className="font-semibold text-zinc-900">
                      {new Date(member.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showFullImage && member.image_url && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={() => setShowFullImage(false)}
          >
            <img
              src={member.image_url}
              className="max-h-[90vh] rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}