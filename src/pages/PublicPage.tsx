import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Member } from '@/src/types';
import { MemberCard } from '@/src/components/MemberCard';
import { MemberForm } from '@/src/components/MemberForm';
import { Search, Loader2, Users, UserPlus, CheckCircle2, MessageCircle, Calendar, Phone, XCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

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

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.profession.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          </div>
        </div>
      </div>

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
