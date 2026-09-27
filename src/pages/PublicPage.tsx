import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Member, Notice } from '@/src/types';
import { MemberCard } from '@/src/components/MemberCard';
import { MemberForm } from '@/src/components/MemberForm';
import { NoticeForm } from '@/src/components/NoticeForm';
import { Search, Loader2, Users, UserPlus, CheckCircle2, MessageCircle, Calendar, Phone, XCircle, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // 0.2 second delay between items as requested
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export function PublicPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeNotice, setActiveNotice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [birthdayFilter, setBirthdayFilter] = useState<'all' | 'upcoming'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isNoticeFormOpen, setIsNoticeFormOpen] = useState(false);
  const [showNoticeSuccess, setShowNoticeSuccess] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchNotices();
  }, []);

  useEffect(() => {
    if (notices.length < 2) return;
    const interval = window.setInterval(() => {
      setActiveNotice((current) => (current + 1) % notices.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [notices.length]);

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching notices:', error);
      return;
    }
    setNotices(data || []);
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUpcomingBirthday = (dob?: string) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return false;

    const today = new Date();
    const currentYear = today.getFullYear();
    const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

    if (nextBirthday < today) {
      const nextYearBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
      return (nextYearBirthday.getTime() - today.getTime()) <= 30 * 24 * 60 * 60 * 1000;
    }

    return (nextBirthday.getTime() - today.getTime()) <= 30 * 24 * 60 * 60 * 1000;
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBirthdayFilter = birthdayFilter === 'all' || isUpcomingBirthday(member.date_of_birth);
    return matchesSearch && matchesBirthdayFilter;
  });

  const goToNotice = (index: number) => {
    setActiveNotice((index + notices.length) % notices.length);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="animate-rainbow bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl" style={{ WebkitBackgroundClip: 'text' }}>
          Sreedashganti Community Directory
        </h1>
        <div className="mt-6 flex flex-col items-center justify-center gap-6">
          <div className="max-w-2xl px-4">
            <p className="text-lg font-medium text-zinc-500 sm:text-xl">
              A professional directory to connect, support, and grow our community members through a unified contact list and life event tracking.
            </p>
            {!loading && members.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-sm font-bold text-zinc-800">
                  {members.length} Members
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link 
              to="/events"
              className="group flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-600 transition-all hover:border-zinc-900 hover:text-zinc-900"
            >
              <Calendar size={16} className="text-zinc-400 transition-colors group-hover:text-zinc-900" />
              View Life Events
            </Link>
            <Link 
              to="/emergency"
              className="group flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-red-600 transition-all hover:border-red-600 hover:bg-red-50"
            >
              <Phone size={16} className="text-red-400 transition-colors group-hover:text-red-600" />
              Emergency Contacts
            </Link>
            <button
              onClick={() => setIsNoticeFormOpen(true)}
              className="group flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 transition-all hover:border-amber-400 hover:bg-amber-100"
            >
              <Megaphone size={16} />
              Submit Notice
            </button>
          </div>
        </div>
      </div>

      {notices.length > 0 && (
        <section className="mb-10 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-amber-800">
            <Megaphone size={20} />
            <h2 className="text-lg font-bold">Latest Notices</h2>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-white">
            <motion.article
              key={notices[activeNotice].id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="grid min-h-[220px] md:grid-cols-[minmax(0,1fr)_280px]"
            >
              <div className="p-5 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold text-zinc-900">{notices[activeNotice].title}</h3>
                  <time className="shrink-0 text-xs text-zinc-400">
                    {new Date(notices[activeNotice].created_at).toLocaleDateString()}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-600">{notices[activeNotice].content}</p>
              </div>
              {notices[activeNotice].image_url && (
                <img src={notices[activeNotice].image_url} alt={notices[activeNotice].title} className="h-48 w-full object-cover md:h-full" />
              )}
            </motion.article>

            {notices.length > 1 && (
              <>
                <button
                  onClick={() => goToNotice(activeNotice - 1)}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-md transition hover:bg-zinc-900 hover:text-white"
                  title="Previous notice"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => goToNotice(activeNotice + 1)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-600 shadow-md transition hover:bg-zinc-900 hover:text-white"
                  title="Next notice"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {notices.length > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {notices.map((notice, index) => (
                <button
                  key={notice.id}
                  onClick={() => goToNotice(index)}
                  className={`h-2 rounded-full transition-all ${index === activeNotice ? 'w-6 bg-amber-600' : 'w-2 bg-amber-300 hover:bg-amber-500'}`}
                  title={`Show notice ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, profession or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-10 pr-10 text-sm shadow-sm transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBirthdayFilter('all')}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${birthdayFilter === 'all' ? 'bg-zinc-900 text-white' : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}
          >
            All Members
          </button>
          <button
            onClick={() => setBirthdayFilter('upcoming')}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${birthdayFilter === 'upcoming' ? 'bg-amber-500 text-white' : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'}`}
          >
            Upcoming Birthdays
          </button>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-lg active:scale-95"
        >
          <UserPlus size={18} />
          Join Directory
        </button>
      </div>

      {showSuccess && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-green-800 border border-green-100">
          <CheckCircle2 className="text-green-500" size={20} />
          <p className="text-sm font-medium">
            Your application has been submitted successfully! An admin will review it soon.
          </p>
          <button 
            onClick={() => setShowSuccess(false)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {showNoticeSuccess && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-amber-800">
          <Megaphone className="text-amber-600" size={20} />
          <p className="text-sm font-medium">Notice submitted. An admin will review it before publishing.</p>
          <button onClick={() => setShowNoticeSuccess(false)} className="ml-auto text-amber-700 hover:text-amber-900">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      ) : filteredMembers.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredMembers.map((member) => (
            <motion.div key={member.id} variants={itemVariants}>
              <MemberCard member={member} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Users size={48} strokeWidth={1} />
          <p className="mt-4 text-lg">
            {searchQuery ? `No members found matching "${searchQuery}"` : "No members found."}
          </p>
        </div>
      )}
      {isFormOpen && (
        <MemberForm
          onSuccess={() => {
            setIsFormOpen(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 8000);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {isNoticeFormOpen && (
        <NoticeForm
          onSuccess={() => {
            setIsNoticeFormOpen(false);
            setShowNoticeSuccess(true);
            setTimeout(() => setShowNoticeSuccess(false), 8000);
          }}
          onCancel={() => setIsNoticeFormOpen(false)}
        />
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://chat.whatsapp.com/G8BepLFH5sPKj0WqrNoS1C"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl transition-all hover:scale-110 hover:bg-green-600 active:scale-95 sm:h-16 sm:w-16"
        title="Join our WhatsApp Group"
      >
        <MessageCircle size={32} />
      </a>
    </div>
  );
}
