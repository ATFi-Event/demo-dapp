import { useEffect, useState } from 'react';
import { useATFiSDK } from '../hooks/useATFiSDK';
import { EventCard } from './EventCard';
import type { EventSummary } from 'atfi';

interface EventListProps {
  onEventClick: (vaultAddress: string) => void;
}

export function EventList({ onEventClick }: EventListProps) {
  const { sdk } = useATFiSDK();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      if (!sdk) return;

      try {
        setLoading(true);
        const allEvents = await sdk.getAllEvents();
        setEvents(allEvents);
        setError(null);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [sdk]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to Load</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-12 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3">No Events Yet</h3>
          <p className="text-gray-400 mb-6">
            Be the first to create a commitment-backed event and start building accountability.
          </p>
          <div className="flex items-center justify-center gap-2 text-indigo-400 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>Connect wallet and click "Create Event" to get started</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-1.5">
          <span className="text-2xl font-bold">{events.length}</span>
          <span className="text-gray-400 text-sm">total events</span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full pulse-live" />
          <span className="text-green-400 text-sm font-medium">
            {events.filter(e => e.status === 'OPEN').length} open
          </span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.vaultAddress}
            event={event}
            onClick={() => onEventClick(event.vaultAddress)}
          />
        ))}
      </div>
    </div>
  );
}
