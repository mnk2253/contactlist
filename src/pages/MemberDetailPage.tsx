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
      alert('Failed to download image. It might be due to cross-origin restrictions.');
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
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft size={18} />
          Back to Directory
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95"
        >
          <AnimatePresence mode="wait" initial={false}>
            {shared ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center gap-2 text-emerald-600"
              >
                <Check size={16} />
                Link Copied!
              </motion.div>
            ) : (
              <motion.div
                key="share"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Share2 size={16} />
                Share Profile
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/50">
        <div className="relative h-32 overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 sm:h-48">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-[12vw] font-black text-white/5 uppercase tracking-tighter whitespace-nowrap">
              {member.name}
            </span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/30 sm:hidden"
            title="Back to Directory"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        
        <div className="relative px-6 pb-8 sm:px-10">
          <div className="flex flex-col items-center -mt-16 sm:-mt-20">
            <div className="group relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-zinc-100 shadow-lg sm:h-40 sm:w-40">
              {member.image_url ? (
                <>
                  <img 
                    src={member.image_url} 
                    alt={member.name} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setShowFullImage(true)}
                      className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-transform hover:scale-110"
                      title="View Full Image"
                    >
                      <Maximize2 size={20} />
                    </button>
                    <button
                      onClick={handleDownloadImage}
                      className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-transform hover:scale-110"
                      title="Download Image"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-zinc-300">
                  {member.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                {member.name}
              </h1>
              <p className="mt-1 text-lg font-medium text-zinc-500">
                {member.profession}
              </p>
              {member.blood_group && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-600/10">
                  <Droplets size={14} />
                  Blood Group: {member.blood_group}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Contact Details</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3 text-zinc-600">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-400">Phone Number</p>
                        <p className="font-semibold text-zinc-900">{member.phone}</p>
                      </div>
                      <a 
                        href={`tel:${member.phone}`}
                        className="ml-auto rounded-lg p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>

                    {member.blood_group && (
                      <div className="flex items-center gap-3 text-zinc-600">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
                          <Droplets size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-zinc-400">Blood Group</p>
                          <p className="font-bold text-red-600">{member.blood_group}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Professional Info</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3 text-zinc-600">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-400">Current Profession</p>
                        <p className="font-semibold text-zinc-900">{member.profession}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Member Since</h3>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3 text-zinc-600">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-400">Joined On</p>
                        <p className="font-semibold text-zinc-900">
                          {new Date(member.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      <AnimatePresence>
        {showFullImage && member.image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setShowFullImage(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-full max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFullImage(false)}
                className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <X size={24} />
              </button>
              <img
                src={member.image_url}
                alt={member.name}
                className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="mt-4 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-sm text-zinc-400">Profile Picture</p>
                </div>
                <button
                  onClick={handleDownloadImage}
                  className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-100 active:scale-95"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
