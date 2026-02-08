import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useATFiSDK } from '../hooks/useATFiSDK';
import type { EventInfo, UserEventInfo } from 'atfi';

interface DashboardProps {
  onEventClick: (vaultAddress: string) => void;
}

interface DashboardData {
  createdEvents: EventInfo[];
  registeredEvents: UserEventInfo[];
  claimableEvents: UserEventInfo[];
  totalClaimable: string;
  tokenBalances: Record<string, string>;
}

export function Dashboard({ onEventClick }: DashboardProps) {
  const { sdk } = useATFiSDK();
  const { address } = useAccount();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      if (!sdk || !address) return;

      try {
        setLoading(true);
        const dashboard = await sdk.getUserDashboard(address);
        setData(dashboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [sdk, address]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
          <p className="text-gray-400">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Token Balances */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(data.tokenBalances).map(([token, balance]) => (
          <div
            key={token}
            className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-6 card-hover"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <span className="text-lg font-bold text-indigo-400">{token.charAt(0)}</span>
              </div>
              <p className="text-sm text-gray-400">{token} Balance</p>
            </div>
            <p className="text-4xl font-bold">{balance}</p>
          </div>
        ))}
      </div>

      {/* Claimable Rewards */}
      {data.claimableEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full pulse-live" />
            <h2 className="text-xl font-bold">Ready to Claim</h2>
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
              {data.claimableEvents.length}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.claimableEvents.map((event) => (
              <button
                key={event.vaultAddress}
                onClick={() => onEventClick(event.vaultAddress)}
                className="bg-[#1a1a24] border border-green-500/30 rounded-2xl p-6 text-left card-hover group glow-success"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm text-gray-500 font-mono">
                    Vault #{event.vaultId.toString()}
                  </span>
                  <span className="badge-open text-xs font-semibold px-2 py-1 rounded-full">
                    ✓ Claimable
                  </span>
                </div>
                <p className="text-3xl font-bold text-green-400 mb-1">
                  {event.userStatus.claimableAmount}
                  <span className="text-gray-400 text-lg ml-2">{event.tokenSymbol}</span>
                </p>
                <p className="text-sm text-gray-400 group-hover:text-green-400 transition-colors">
                  Click to claim →
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events as Organizer */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Events (Organizer)</h2>
          <span className="text-gray-400 text-sm">{data.createdEvents.length} events</span>
        </div>
        {data.createdEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.createdEvents.map((event) => (
              <button
                key={event.vaultAddress}
                onClick={() => onEventClick(event.vaultAddress)}
                className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-6 text-left card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm text-gray-500 font-mono">
                    Vault #{event.vaultId.toString()}
                  </span>
                  {event.stakingOpen && !event.eventStarted && (
                    <span className="badge-open text-xs px-2 py-1 rounded-full">Open</span>
                  )}
                  {event.eventStarted && !event.settled && (
                    <span className="badge-started text-xs px-2 py-1 rounded-full">In Progress</span>
                  )}
                  {event.settled && (
                    <span className="badge-settled text-xs px-2 py-1 rounded-full">Settled</span>
                  )}
                </div>
                <p className="text-2xl font-bold mb-1">
                  {event.stakeAmount}
                  <span className="text-gray-400 text-lg ml-2">{event.tokenSymbol}</span>
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2a2a3a]">
                  <span className="text-sm text-gray-400">
                    {event.currentParticipants} / {event.maxParticipants} joined
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a1a24] border border-[#2a2a3a] border-dashed rounded-2xl p-10 text-center">
            <p className="text-gray-400">You haven't created any events yet</p>
          </div>
        )}
      </div>

      {/* Registered Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Registered Events</h2>
          <span className="text-gray-400 text-sm">{data.registeredEvents.length} events</span>
        </div>
        {data.registeredEvents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.registeredEvents.map((event) => (
              <button
                key={event.vaultAddress}
                onClick={() => onEventClick(event.vaultAddress)}
                className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-6 text-left card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm text-gray-500 font-mono">
                    Vault #{event.vaultId.toString()}
                  </span>
                  <div className="flex gap-1.5">
                    {event.userStatus.isVerified && (
                      <span className="badge-open text-xs px-2 py-1 rounded-full">✓ Verified</span>
                    )}
                    {event.userStatus.hasClaimed && (
                      <span className="badge-settled text-xs px-2 py-1 rounded-full">Claimed</span>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">
                  {event.stakeAmount}
                  <span className="text-gray-400 text-lg ml-2">{event.tokenSymbol}</span>
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#2a2a3a]">
                  <span className="text-sm text-gray-400">
                    {event.currentParticipants} / {event.maxParticipants} joined
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a1a24] border border-[#2a2a3a] border-dashed rounded-2xl p-10 text-center">
            <p className="text-gray-400">You haven't registered for any events</p>
          </div>
        )}
      </div>
    </div>
  );
}
