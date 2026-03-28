import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { EmergencyContact } from '../types';
import { Phone, Loader2, AlertTriangle, Search, XCircle, ExternalLink, ShieldAlert, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ContactCardProps {
  contact: EmergencyContact;
  index: number;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white p-6 rounded-3xl border border-zinc-200 hover:border-zinc-900 transition-all hover:shadow-2xl hover:shadow-zinc-200/50"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-zinc-900 truncate group-hover:text-red-600 transition-colors">
            {contact.name}
          </h3>
          <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            {contact.relationship}
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
          <Phone size={24} />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone Number</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1 text-emerald-600"
                  >
                    <Check size={10} />
                    Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-1"
                  >
                    <Copy size={10} />
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
          <span className="text-2xl font-mono font-bold text-zinc-900 tracking-tight">
            {contact.phone}
          </span>
        </div>
        
        <a
          href={`tel:${contact.phone}`}
          className="mt-4 flex items-center justify-center w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-red-600 transition-all gap-2 group/btn active:scale-95"
        >
          <Phone className="w-5 h-5 group-hover/btn:animate-bounce" />
          Call Now
          <ExternalLink size={14} className="opacity-50" />
        </a>
      </div>

      {/* Decorative element */}
      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1 h-1 rounded-full bg-red-500" />
      </div>
    </motion.div>
  );
};

export const EmergencyContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.relationship.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-zinc-900" />
          <p className="text-sm font-medium text-zinc-500 animate-pulse">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-widest mb-4 border border-red-100"
              >
                <ShieldAlert size={14} />
                Emergency Support
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl font-black tracking-tight text-zinc-900 sm:text-6xl"
              >
                Emergency <span className="text-zinc-400">Contacts</span>
              </motion.h1>
            </div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full md:w-80"
            >
              <div className="group relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-11 py-4 border border-zinc-200 rounded-2xl bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all shadow-sm"
                />
                <AnimatePresence>
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredContacts.length === 0 ? (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300">
                    <Search size={24} />
                  </div>
                  <p className="text-zinc-500 font-medium">
                    {searchTerm ? `No results for "${searchTerm}"` : "No emergency contacts listed."}
                  </p>
                </div>
              </motion.div>
            ) : (
              filteredContacts.map((contact, index) => (
                <ContactCard key={contact.id} contact={contact} index={index} />
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
