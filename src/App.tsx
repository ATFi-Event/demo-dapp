import { useState } from 'react';
import { Header } from './components/Header';
import { EventList } from './components/EventList';
import { Dashboard } from './components/Dashboard';
import { CreateEventModal } from './components/CreateEventModal';
import { EventDetail } from './components/EventDetail';
import { useAccount } from 'wagmi';

type View = 'events' | 'dashboard' | 'event-detail';

function App() {
  const [view, setView] = useState<View>('events');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const { isConnected } = useAccount();

  const handleEventClick = (vaultAddress: string) => {
    setSelectedEvent(vaultAddress);
    setView('event-detail');
  };

  const handleBack = () => {
    setSelectedEvent(null);
    setView('events');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] gradient-bg">
      <Header
        currentView={view}
        onViewChange={setView}
        onCreateEvent={() => setShowCreateModal(true)}
      />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {view === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Active Events</h2>
                <p className="text-gray-400 mt-1">Browse and join commitment-backed events</p>
              </div>
            </div>
            <EventList onEventClick={handleEventClick} />
          </div>
        )}

        {view === 'dashboard' && isConnected && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Your Dashboard</h2>
              <p className="text-gray-400 mt-1">Manage your events and claims</p>
            </div>
            <Dashboard onEventClick={handleEventClick} />
          </div>
        )}

        {view === 'event-detail' && selectedEvent && (
          <EventDetail
            vaultAddress={selectedEvent}
            onBack={handleBack}
          />
        )}
      </main>

      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

export default App;
