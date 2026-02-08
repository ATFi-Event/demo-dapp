import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: 'events' | 'dashboard') => void;
  onCreateEvent: () => void;
}

// ATFi Logo SVG component
function ATFiLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25 50V35C25 21.193 36.193 10 50 10C63.807 10 75 21.193 75 35V50"
        stroke="#6366F1"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="10" y="50" width="80" height="60" rx="12" fill="#6366F1" />
      <path
        d="M32 80L45 93L68 67"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Header({ currentView, onViewChange, onCreateEvent }: HeaderProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getNetworkName = () => {
    if (chainId === 8453) return 'Base';
    if (chainId === 84532) return 'Sepolia';
    return 'Unknown';
  };

  return (
    <header className="border-b border-[#2a2a3a] glass sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <ATFiLogo size={28} />
            <div>
              <h1 className="text-xl font-bold gradient-text">ATFi</h1>
              <p className="text-[10px] text-gray-500 -mt-1">Commitment Protocol</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 bg-[#12121a] rounded-lg p-1">
            <button
              onClick={() => onViewChange('events')}
              className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                currentView === 'events'
                  ? 'bg-indigo-500/20 text-indigo-400 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Events
            </button>
            {isConnected && (
              <button
                onClick={() => onViewChange('dashboard')}
                className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-500/20 text-indigo-400 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <button
              onClick={onCreateEvent}
              className="btn-primary text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </button>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2">
              {/* Network indicator */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div className={`w-2 h-2 rounded-full ${chainId === 8453 ? 'bg-green-400' : 'bg-yellow-400'} pulse-live`} />
                <span className="text-xs text-gray-400">{getNetworkName()}</span>
              </div>
              
              {/* Address */}
              <div className="flex items-center bg-[#1a1a24] border border-[#2a2a3a] rounded-lg overflow-hidden">
                <span className="px-4 py-2 text-sm font-mono text-gray-300">
                  {formatAddress(address!)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="text-gray-400 hover:text-red-400 p-2 hover:bg-red-500/10 transition-colors border-l border-[#2a2a3a]"
                  title="Disconnect"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="btn-primary text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
