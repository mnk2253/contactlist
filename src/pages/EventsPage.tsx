import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { LifeEvent } from '@/src/types';
import { Calendar, Heart, Skull, Loader2, Search, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export function EventsPage() {
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'marriage' | 'death'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('life_events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || event.type === filter;
    return matchesSearch && matchesFilter;
  });

  const calculateTimeElapsed = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    
    let years = now.getFullYear() - eventDate.getFullYear();
    let months = now.getMonth() - eventDate.getMonth();
    let days = now.getDate() - eventDate.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);

    return parts.length > 0 ? parts.join(', ') + ' ago' : 'Today';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl">
          Life Events
        </h1>
        <p className="mt-4 text-zinc-500">
          Remembering and celebrating the milestones in our community.
        </p>
      </div>

      <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search by name..."
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

        <div className="flex gap-2">
          {(['all', 'marriage', 'death'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                filter === f
                  ? "bg-zinc-900 text-white shadow-lg"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      ) : filteredEvents.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                layout
                className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 transition-all hover:shadow-xl hover:shadow-zinc-200/50"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                      <span className="text-4xl font-bold">{event.name.charAt(0)}</span>
                    </div>
                  )}
                  
                  <div className={cn(
                    "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg",
                    event.type === 'marriage' ? "bg-pink-500 text-white" : "bg-zinc-900 text-white"
                  )}>
                    {event.type === 'marriage' ? <Heart size={20} /> : <Skull size={20} />}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-bold text-zinc-900">{event.name}</h3>
                  <div className="mt-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Calendar size={14} />
                      <span>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    </div>
                    <div className="text-[11px] font-medium text-zinc-400">
                      {calculateTimeElapsed(event.date)}
                    </div>
                  </div>
                  <p className={cn(
                    "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                    event.type === 'marriage' ? "bg-pink-50 text-pink-600" : "bg-zinc-100 text-zinc-600"
                  )}>
                    {event.type === 'marriage' ? 'Marriage (Biya)' : 'Passed Away (Moron)'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <Calendar size={48} strokeWidth={1} />
          <p className="mt-4 text-lg">
            {searchQuery ? `No events found matching "${searchQuery}"` : "No events found."}
          </p>
        </div>
      )}
    </div>
  );
}
