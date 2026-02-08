import type { EventSummary, EventStatus } from 'atfi';

interface EventCardProps {
  event: EventSummary;
  onClick: () => void;
}

const statusConfig: Record<EventStatus, { className: string; label: string; icon: string }> = {
  OPEN: { 
    className: 'badge-open',
    label: 'Open', 
    icon: '🟢'
  },
  STARTED: { 
    className: 'badge-started',
    label: 'In Progress', 
    icon: '🟡'
  },
  SETTLED: { 
    className: 'badge-settled',
    label: 'Settled', 
    icon: '🔵'
  },
};

export function EventCard({ event, onClick }: EventCardProps) {
  const status = statusConfig[event.status];
  const spotsLeft = event.maxParticipants - event.currentParticipants;
  const progress = (event.currentParticipants / event.maxParticipants) * 100;
  const isFull = spotsLeft === 0;

  return (
    <button
      onClick={onClick}
      className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-6 text-left card-hover w-full group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-300">Vault #{event.vaultId.toString()}</span>
            <p className="text-xs text-gray-500 font-mono">
              {event.vaultAddress.slice(0, 8)}...{event.vaultAddress.slice(-4)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Stake Amount */}
      <div className="mb-5">
        <p className="text-sm text-gray-400 mb-1">Stake Amount</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{event.stakeAmount}</span>
          <span className="text-lg text-gray-400">{event.tokenSymbol}</span>
        </div>
      </div>

      {/* Participants Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Participants</span>
          <span className="font-semibold">
            {event.currentParticipants} 
            <span className="text-gray-500"> / {event.maxParticipants}</span>
          </span>
        </div>
        <div className="h-2.5 bg-[#2a2a3a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-green-500' : 'progress-bar'}`}
            style={{ width: `${Math.max(progress, 5)}%` }}
          />
        </div>
        {event.status === 'OPEN' && (
          <p className={`text-xs mt-2 ${isFull ? 'text-yellow-400' : 'text-gray-500'}`}>
            {isFull ? '⚠️ Event is full' : `${spotsLeft} spots remaining`}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#2a2a3a]">
        <span className="text-sm text-gray-400">View details</span>
        <svg 
          className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </button>
  );
}
