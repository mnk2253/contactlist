import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, LogOut, MessageCircle, Calendar } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { useEffect, useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <Users size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">Contact List</span>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-4">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              location.pathname === "/" 
                ? "bg-zinc-100 text-zinc-900" 
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <Users size={18} />
            <span className="hidden sm:inline">Contact List</span>
          </Link>

          <Link
            to="/events"
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              location.pathname === "/events" 
                ? "bg-zinc-100 text-zinc-900" 
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            )}
          >
            <Calendar size={18} />
            <span className="hidden sm:inline">Events</span>
          </Link>

          <a
            href="https://chat.whatsapp.com/G8BepLFH5sPKj0WqrNoS1C"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-green-600 transition-colors hover:bg-green-50 hover:text-green-700"
          >
            <MessageCircle size={18} />
            <span className="hidden md:inline">Join WhatsApp</span>
          </a>
          
          {user ? (
            <>
              <Link
                to="/admin"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === "/admin" 
                    ? "bg-zinc-900 text-white" 
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <ShieldCheck size={18} />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === "/login" 
                  ? "bg-zinc-900 text-white" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <ShieldCheck size={18} />
              <span className="hidden sm:inline">Admin Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
