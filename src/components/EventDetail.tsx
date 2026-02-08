import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useATFiSDK } from '../hooks/useATFiSDK';
import type { EventInfo, ParticipantInfo } from 'atfi';
import type { Address } from 'viem';

interface EventDetailProps {
  vaultAddress: string;
  onBack: () => void;
}

export function EventDetail({ vaultAddress, onBack }: EventDetailProps) {
  const { sdk, isReadOnly } = useATFiSDK();
  const { address } = useAccount();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [userStatus, setUserStatus] = useState<ParticipantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!sdk) return;

      try {
        setLoading(true);
        const info = await sdk.getEventInfo(vaultAddress as Address);
        setEvent(info);

        if (address) {
          const status = await sdk.getParticipantStatus(vaultAddress as Address, address);
          setUserStatus(status);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sdk, vaultAddress, address]);

  const handleRegister = async () => {
    if (!sdk || isReadOnly) return;

    setError(null);
    setActionStatus('Simulating...');

    try {
      const action = await sdk.register({ vaultAddress: vaultAddress as Address });

      if (!action.simulation.success) {
        // If approval needed, SDK auto-handles it in execute, so simulation should be success OR we need to suppress needsApproval error?
        // Wait, _simulateRegister still returns needsApproval.
        // If needsApproval is true, simulation success is FALSE in my previous edit.
        // I need to change _simulateRegister to return success: TRUE even if needsApproval is true, 
        // OR update this component to proceed even if success is false BUT needsApproval is true.
        // Let's update component to proceed if needsApproval is true.
        if (action.simulation.error && !action.simulation.needsApproval) {
             setError(action.simulation.error.message);
             setActionStatus('');
             return;
        }
      }

      setActionStatus('Please confirm transactions...');
      await action.execute({
        onApproving: () => setActionStatus('Approving token (1/2)...'),
        onApproved: () => setActionStatus('Approval submitted...'),
        onSubmitting: () => setActionStatus('Registering (2/2)...'),
        onSubmitted: (hash) => setActionStatus(`TX: ${hash.slice(0, 10)}...`),
        onConfirming: () => setActionStatus('Waiting for confirmation...'),
      });

      setActionStatus('Registered!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed';
      setError(errorMessage);
      setActionStatus('');
    }
  };

  const handleStartEvent = async () => {
    if (!sdk || isReadOnly) return;

    setError(null);
    setActionStatus('Simulating...');

    try {
      const action = await sdk.startEvent({ vaultAddress: vaultAddress as Address });

      if (!action.simulation.success) {
        setError(action.simulation.error?.message || 'Cannot start event');
        setActionStatus('');
        return;
      }

      setActionStatus('Confirm in wallet...');
      await action.execute({
        onSubmitting: () => setActionStatus('Starting event...'),
        onConfirming: () => setActionStatus('Confirming...'),
      });

      setActionStatus('Event started!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed';
      setError(errorMessage);
      setActionStatus('');
    }
  };

  const handleSettle = async () => {
    if (!sdk || isReadOnly) return;

    setError(null);
    setActionStatus('Simulating...');

    try {
      const action = await sdk.settleEvent({ vaultAddress: vaultAddress as Address });

      if (!action.simulation.success) {
        setError(action.simulation.error?.message || 'Cannot settle');
        setActionStatus('');
        return;
      }

      setActionStatus('Confirm in wallet...');
      await action.execute({
        onSubmitting: () => setActionStatus('Settling event...'),
        onConfirming: () => setActionStatus('Confirming...'),
      });

      setActionStatus('Event settled!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed';
      setError(errorMessage);
      setActionStatus('');
    }
  };

  const handleClaim = async () => {
    if (!sdk || isReadOnly) return;

    setError(null);
    setActionStatus('Simulating...');

    try {
      const action = await sdk.claim({ vaultAddress: vaultAddress as Address });

      if (!action.simulation.success) {
        setError(action.simulation.error?.message || 'Cannot claim');
        setActionStatus('');
        return;
      }

      setActionStatus('Confirm in wallet...');
      await action.execute({
        onSubmitting: () => setActionStatus('Claiming reward...'),
        onConfirming: () => setActionStatus('Confirming...'),
      });

      setActionStatus(`Claimed ${action.simulation.claimableAmount}!`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed';
      setError(errorMessage);
      setActionStatus('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading event...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">Event not found</p>
        <button onClick={onBack} className="mt-4 text-indigo-400 hover:text-indigo-300">
          Go back
        </button>
      </div>
    );
  }

  const isOwner = address?.toLowerCase() === event.owner.toLowerCase();
  const progress = (event.currentParticipants / event.maxParticipants) * 100;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-sm text-gray-500 font-mono">Vault #{event.vaultId.toString()}</span>
                <h2 className="text-3xl font-bold mt-1">
                  {event.stakeAmount} <span className="text-gray-400">{event.tokenSymbol}</span>
                </h2>
                <p className="text-gray-400">Stake per participant</p>
              </div>
              <div className="text-right">
                {event.stakingOpen && !event.eventStarted && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    Open
                  </span>
                )}
                {event.eventStarted && !event.settled && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                    Started
                  </span>
                )}
                {event.settled && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                    Settled
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Participants</span>
                  <span>{event.currentParticipants} / {event.maxParticipants}</span>
                </div>
                <div className="h-3 bg-[#2a2a3a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-[#12121a] rounded-lg">
                  <p className="text-sm text-gray-400">Verified</p>
                  <p className="text-xl font-bold">{event.verifiedCount}</p>
                </div>
                <div className="p-4 bg-[#12121a] rounded-lg">
                  <p className="text-sm text-gray-400">Total Staked</p>
                  <p className="text-xl font-bold">{event.totalStaked} {event.tokenSymbol}</p>
                </div>
              </div>

              {event.hasYield && event.yieldInfo && (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-indigo-400 font-medium">Yield Enabled</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Estimated yield: <span className="text-white">{event.yieldInfo.estimatedYield} {event.tokenSymbol}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6">
            <h3 className="font-semibold mb-4">Contract Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Vault Address</span>
                <span className="font-mono">{event.vaultAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Owner</span>
                <span className="font-mono">{event.owner.slice(0, 10)}...{event.owner.slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token</span>
                <span className="font-mono">{event.assetToken.slice(0, 10)}...{event.assetToken.slice(-8)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* User Status */}
          {userStatus && (
            <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6">
              <h3 className="font-semibold mb-4">Your Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${userStatus.hasStaked ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span className={userStatus.hasStaked ? 'text-white' : 'text-gray-500'}>Registered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${userStatus.isVerified ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span className={userStatus.isVerified ? 'text-white' : 'text-gray-500'}>Verified</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${userStatus.hasClaimed ? 'bg-green-500' : 'bg-gray-600'}`} />
                  <span className={userStatus.hasClaimed ? 'text-white' : 'text-gray-500'}>Claimed</span>
                </div>
                {userStatus.claimableAmount !== '0' && (
                  <div className="pt-3 border-t border-[#2a2a3a]">
                    <p className="text-sm text-gray-400">Claimable</p>
                    <p className="text-xl font-bold text-green-400">{userStatus.claimableAmount} {event.tokenSymbol}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-xl p-6">
            <h3 className="font-semibold mb-4">Actions</h3>

            {error && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {actionStatus && (
              <div className="p-3 mb-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {actionStatus}
              </div>
            )}

            <div className="space-y-3">
              {/* Participant Actions */}
              {!isOwner && event.stakingOpen && !userStatus?.hasStaked && (
                <button
                  onClick={handleRegister}
                  disabled={isReadOnly || !!actionStatus}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Register ({event.stakeAmount} {event.tokenSymbol})
                </button>
              )}

              {userStatus?.isVerified && event.settled && !userStatus?.hasClaimed && (
                <button
                  onClick={handleClaim}
                  disabled={isReadOnly || !!actionStatus}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Claim Reward
                </button>
              )}

              {/* Owner Actions */}
              {isOwner && (
                <>
                  {event.stakingOpen && !event.eventStarted && (
                    <button
                      onClick={handleStartEvent}
                      disabled={isReadOnly || !!actionStatus || event.currentParticipants === 0}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-medium py-3 rounded-lg transition-colors"
                    >
                      Start Event
                    </button>
                  )}

                  {event.eventStarted && !event.settled && (
                    <button
                      onClick={handleSettle}
                      disabled={isReadOnly || !!actionStatus}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      Settle Event
                    </button>
                  )}

                  <p className="text-xs text-gray-500 text-center pt-2">
                    You are the event owner
                  </p>
                </>
              )}

              {!address && (
                <p className="text-center text-gray-400 text-sm">
                  Connect wallet to interact
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
