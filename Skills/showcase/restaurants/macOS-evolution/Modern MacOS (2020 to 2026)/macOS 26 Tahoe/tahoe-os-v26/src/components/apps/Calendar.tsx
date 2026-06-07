import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusSignIcon, 
  ArrowLeft01Icon, 
  ArrowRight01Icon,
  Calendar01Icon,
  Clock01Icon,
  Location01Icon
} from 'hugeicons-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  location?: string;
  time?: string;
}

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: 'Tahoe OS Review', date: new Date(), time: '10:00 AM', location: 'Infinite Loop' },
    { id: '2', title: 'Design Sync', date: new Date(), time: '2:00 PM', location: 'Apple Park' },
  ]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', location: '', time: '' });

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const addEvent = () => {
    if (!newEvent.title) return;
    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      location: newEvent.location,
      time: newEvent.time,
      date: new Date(currentDate),
    };
    setEvents([...events, event]);
    setNewEvent({ title: '', location: '', time: '' });
    setShowAddEvent(false);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = [];
  const totalDays = daysInMonth(year, currentDate.getMonth());
  const offset = firstDayOfMonth(year, currentDate.getMonth());

  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#1c1c1e] text-black dark:text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-50 dark:bg-[#2c2c2e]/50 border-r border-zinc-200 dark:border-white/5 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-red-500 font-bold text-sm uppercase tracking-wider">{currentDate.toLocaleString('default', { month: 'short' })}</span>
            <h2 className="text-2xl font-black">{year}</h2>
          </div>
          <button 
            onClick={() => setShowAddEvent(true)}
            className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-red-600 transition-colors"
          >
            <PlusSignIcon size={18} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto scrollbar-hide">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Upcoming</h3>
          {events.map(event => (
            <div key={event.id} className="flex gap-3 items-start group">
              <div className="w-1 h-10 bg-red-500 rounded-full" />
              <div>
                <p className="text-sm font-bold leading-tight">{event.title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{event.time || 'All Day'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold">{monthName} <span className="text-zinc-400 font-medium">{year}</span></h1>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors text-zinc-500"><ArrowLeft01Icon size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors">Today</button>
            <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors text-zinc-500"><ArrowRight01Icon size={20} /></button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-hidden border-r border-b border-zinc-200 dark:border-white/5">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-[10px] font-black text-zinc-400 border-r border-zinc-200 dark:border-white/5 last:border-r-0">
              {day}
            </div>
          ))}
          {days.map((day, i) => {
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            return (
              <div 
                key={i} 
                className={`border-t border-r border-zinc-200 dark:border-white/5 last:border-r-0 p-2 flex flex-col gap-1 transition-colors hover:bg-zinc-50 dark:hover:bg-white/[0.02] ${day ? '' : 'bg-zinc-50/50 dark:bg-white/[0.01]'}`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-red-500 text-white' : ''}`}>
                      {day}
                    </span>
                    <div className="flex flex-col gap-1 overflow-hidden">
                      {events
                        .filter(e => e.date.getDate() === day && e.date.getMonth() === currentDate.getMonth())
                        .map(e => (
                          <div key={e.id} className="text-[9px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 truncate">
                            {e.title}
                          </div>
                        ))
                      }
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white dark:bg-[#2c2c2e] rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6"
            >
              <h2 className="text-xl font-bold mb-6">New Event</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/5 p-3 rounded-xl border border-zinc-200 dark:border-white/5">
                  <Calendar01Icon size={20} className="text-red-500" />
                  <input 
                    autoFocus
                    placeholder="Event Title"
                    className="bg-transparent border-none w-full text-sm font-medium focus:outline-none"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/5 p-3 rounded-xl border border-zinc-200 dark:border-white/5">
                  <Location01Icon size={20} className="text-zinc-400" />
                  <input 
                    placeholder="Location"
                    className="bg-transparent border-none w-full text-sm font-medium focus:outline-none"
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-white/5 p-3 rounded-xl border border-zinc-200 dark:border-white/5">
                  <Clock01Icon size={20} className="text-zinc-400" />
                  <input 
                    placeholder="Time (e.g., 10:00 AM)"
                    className="bg-transparent border-none w-full text-sm font-medium focus:outline-none"
                    value={newEvent.time}
                    onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setShowAddEvent(false)}
                  className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-white/10 rounded-xl font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={addEvent}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-bold text-sm"
                >
                  Add Event
                </button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddEvent(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
