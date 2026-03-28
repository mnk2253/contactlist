import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Member, LifeEvent, EmergencyContact } from '@/src/types';
import { MemberForm } from '@/src/components/MemberForm';
import { EventForm } from '@/src/components/EventForm';
import { EmergencyContactForm } from '@/src/components/EmergencyContactForm';
import { Plus, Edit2, Trash2, Loader2, UserPlus, CheckCircle, XCircle, Users, Calendar, Heart, Skull, Phone, Search, Eye, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'emergency'>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | undefined>();

  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | undefined>();

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers();
    } else if (activeTab === 'events') {
      fetchEvents();
    } else {
      fetchContacts();
    }
  }, [activeTab]);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSecondName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    return parts.length > 1 ? parts[1].toLowerCase() : parts[0].toLowerCase();
  };

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortDirection) return 0;
    const nameA = getSecondName(a.name);
    const nameB = getSecondName(b.name);
    
    if (sortDirection === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  const toggleSort = () => {
    if (sortDirection === 'asc') setSortDirection('desc');
    else if (sortDirection === 'desc') setSortDirection(null);
    else setSortDirection('asc');
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.relationship.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
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

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      alert(`Error fetching emergency contacts: ${error.message || 'Unknown error'}. Please ensure the 'emergency_contacts' table exists in Supabase.`);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete member');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('life_events').delete().eq('id', id);
      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event');
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
      if (error) throw error;
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Failed to delete contact');
    }
  };

  const handleApproveMember = async (id: string) => {
    try {
      const { error } = await supabase.from('members').update({ is_approved: true }).eq('id', id);
      if (error) throw error;
      fetchMembers();
    } catch (error: any) {
      console.error('Error approving member:', error);
      alert(`Failed to approve member: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRejectMember = async (id: string) => {
    if (!confirm('Are you sure you want to reject and delete this application?')) return;
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      fetchMembers();
    } catch (error: any) {
      console.error('Error rejecting member:', error);
      alert(`Failed to reject member: ${error.message || 'Unknown error'}`);
    }
  };

  const handleAddMember = () => {
    setEditingMember(undefined);
    setIsMemberFormOpen(true);
  };

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setIsEventFormOpen(true);
  };

  const handleAddContact = () => {
    setEditingContact(undefined);
    setIsContactFormOpen(true);
  };

  const handleAddAction = () => {
    if (activeTab === 'members') handleAddMember();
    else if (activeTab === 'events') handleAddEvent();
    else handleAddContact();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Admin Panel</h1>
          <p className="text-zinc-500">Manage your community data.</p>
        </div>
        
        <div className="flex gap-2 rounded-2xl bg-zinc-100 p-1">
          <button
            onClick={() => setActiveTab('members')}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
              activeTab === 'members' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <Users size={18} />
            Members
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
              activeTab === 'events' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <Calendar size={18} />
            Events
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
              activeTab === 'emergency' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <Phone size={18} />
            Emergency
          </button>
        </div>

        <button
          onClick={handleAddAction}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 hover:shadow-lg active:scale-95"
        >
          <Plus size={18} />
          Add {activeTab === 'members' ? 'Member' : activeTab === 'events' ? 'Event' : 'Contact'}
        </button>
      </div>

      <div className="mb-6 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder={`Search ${activeTab === 'emergency' ? 'contacts' : activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-zinc-200 rounded-xl text-sm bg-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent shadow-sm transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
          >
            <XCircle size={16} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      ) : activeTab === 'members' ? (
        filteredMembers.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th 
                    className="px-6 py-4 cursor-pointer hover:text-zinc-900 transition-colors"
                    onClick={toggleSort}
                  >
                    <div className="flex items-center gap-2">
                      Member
                      {sortDirection === 'asc' && <ChevronUp size={14} className="text-zinc-900" />}
                      {sortDirection === 'desc' && <ChevronDown size={14} className="text-zinc-900" />}
                      {!sortDirection && <ArrowUpDown size={14} className="opacity-30" />}
                    </div>
                  </th>
                  <th className="hidden px-6 py-4 md:table-cell">Profession</th>
                  <th className="hidden px-6 py-4 sm:table-cell">Phone</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {sortedMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    className="group cursor-pointer hover:bg-zinc-50/50"
                    onClick={() => navigate(`/admin/members/${member.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                          {member.image_url ? (
                            <img src={member.image_url} alt={member.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-400">{member.name.charAt(0)}</div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-zinc-900">{member.name}</span>
                          {!member.is_approved && <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending Approval</span>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-zinc-600 md:table-cell">{member.profession}</td>
                    <td className="hidden px-6 py-4 text-zinc-600 sm:table-cell">{member.phone}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => navigate(`/admin/members/${member.id}`)}
                          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {!member.is_approved && (
                          <>
                            <button onClick={() => handleApproveMember(member.id)} className="flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100" title="Approve Member">
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button onClick={() => handleRejectMember(member.id)} className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100" title="Reject Member">
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        <button onClick={() => { setEditingMember(member); setIsMemberFormOpen(true); }} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteMember(member.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <UserPlus size={48} strokeWidth={1} />
            <p className="mt-4 text-lg">{searchTerm ? `No members matching "${searchTerm}"` : "No members yet."}</p>
          </div>
        )
      ) : activeTab === 'events' ? (
        filteredEvents.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Person</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="group hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                          {event.image_url ? (
                            <img src={event.image_url} alt={event.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-400">{event.name.charAt(0)}</div>
                          )}
                        </div>
                        <span className="font-medium text-zinc-900">{event.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
                        event.type === 'marriage' ? "bg-pink-50 text-pink-600" : "bg-zinc-100 text-zinc-600"
                      )}>
                        {event.type === 'marriage' ? <Heart size={12} /> : <Skull size={12} />}
                        {event.type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-600">{new Date(event.date).toLocaleDateString()}</span>
                        <span className="text-[10px] font-medium text-zinc-400">{calculateTimeElapsed(event.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingEvent(event); setIsEventFormOpen(true); }} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Calendar size={48} strokeWidth={1} />
            <p className="mt-4 text-lg">{searchTerm ? `No events matching "${searchTerm}"` : "No events yet."}</p>
          </div>
        )
      ) : (
        filteredContacts.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Relationship</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="group hover:bg-zinc-50/50">
                    <td className="px-6 py-4 font-medium text-zinc-900">{contact.name}</td>
                    <td className="px-6 py-4 text-zinc-600">{contact.phone}</td>
                    <td className="px-6 py-4 text-zinc-600">{contact.relationship}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingContact(contact); setIsContactFormOpen(true); }} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteContact(contact.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Phone size={48} strokeWidth={1} />
            <p className="mt-4 text-lg">{searchTerm ? `No contacts matching "${searchTerm}"` : "No emergency contacts yet."}</p>
          </div>
        )
      )}

      {isMemberFormOpen && (
        <MemberForm
          member={editingMember}
          isAdmin={true}
          onSuccess={() => { setIsMemberFormOpen(false); fetchMembers(); }}
          onCancel={() => setIsMemberFormOpen(false)}
        />
      )}

      {isEventFormOpen && (
        <EventForm
          event={editingEvent}
          onSuccess={() => { setIsEventFormOpen(false); fetchEvents(); }}
          onCancel={() => setIsEventFormOpen(false)}
        />
      )}

      {isContactFormOpen && (
        <EmergencyContactForm
          contact={editingContact}
          onSuccess={() => { setIsContactFormOpen(false); fetchContacts(); }}
          onCancel={() => setIsContactFormOpen(false)}
        />
      )}
    </div>
  );
}
