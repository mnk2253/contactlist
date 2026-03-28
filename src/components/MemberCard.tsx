import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Member } from '@/src/types';
import { Phone, Briefcase, Calendar, Copy, Check, Share2, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(member.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const url = `${window.location.origin}/members/${member.id}`;
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  return (
    <div 
      className="animate-rainbow rounded-2xl p-[2px] transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-zinc-400/20 cursor-pointer"
      onClick={() => navigate(`/members/${member.id}`)}
    >
      <div className="group relative h-full overflow-hidden rounded-[14px] border border-zinc-200 bg-white p-3 transition-all sm:p-4">
        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 transition-all hover:bg-zinc-900 hover:text-white active:scale-90 sm:h-9 sm:w-9"
          title="Share profile"
        >
          <AnimatePresence mode="wait" initial={false}>
            {shared ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Check size={16} className="text-emerald-500" />
              </motion.div>
            ) : (
              <motion.div
                key="share"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Share2 size={16} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-32 sm:w-32">
          {member.image_url ? (
            <img
              src={member.image_url}
              alt={member.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              <span className="text-2xl font-bold">{member.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center min-w-0">
          <h3 className="truncate text-base font-bold text-zinc-900 sm:text-xl">{member.name}</h3>
          
          <div className="mt-1.5 space-y-1 sm:mt-2 sm:space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 sm:gap-2 sm:text-sm">
              <Briefcase size={12} className="shrink-0 text-zinc-400 sm:size-[14px]" />
              <span className="truncate">{member.profession}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-600 sm:gap-2 sm:text-sm">
              <Phone size={12} className="shrink-0 text-zinc-400 sm:size-[14px]" />
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                <span className="truncate">{member.phone}</span>
                <button
                  onClick={handleCopy}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-zinc-50 text-zinc-400 transition-all hover:bg-zinc-900 hover:text-white active:scale-90 sm:h-6 sm:w-6"
                  title="Copy phone number"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check size={12} className="text-emerald-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Copy size={12} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 sm:gap-2 sm:text-xs">
              <Calendar size={10} className="sm:size-3" />
              <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
            </div>
            {member.blood_group && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 sm:gap-2 sm:text-xs">
                <Droplets size={10} className="sm:size-3" />
                <span>Blood Group: {member.blood_group}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
