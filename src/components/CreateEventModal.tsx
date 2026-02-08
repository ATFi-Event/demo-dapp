import { useState } from 'react';
import { useATFiSDK } from '../hooks/useATFiSDK';

interface CreateEventModalProps {
  onClose: () => void;
}

type Step = 'form' | 'preview' | 'executing';

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const { sdk, isReadOnly } = useATFiSDK();
  const [step, setStep] = useState<Step>('form');
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [stakeAmount, setStakeAmount] = useState('10');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [useYield, setUseYield] = useState(true);
  const [token, setToken] = useState<'USDC' | 'IDRX'>('USDC');

  // Simulation result
  const [simulation, setSimulation] = useState<{
    success: boolean;
    expectedVaultId?: bigint;
    gasEstimate?: bigint;
    error?: { code: string; message: string };
  } | null>(null);

  // Execute function from action
  const [executeAction, setExecuteAction] = useState<(() => Promise<void>) | null>(null);

  const handlePreview = async () => {
    if (!sdk || isReadOnly) return;

    setError(null);
    setStatus('Simulating...');
    setSimulation(null);

    try {
      const action = await sdk.createEvent({
        stakeAmount,
        maxParticipants: parseInt(maxParticipants),
        useYield,
        token,
      });

      setSimulation(action.simulation);

      if (action.simulation.success) {
        setExecuteAction(() => async () => {
          setStep('executing');
          setStatus('Waiting for wallet...');
          try {
            const result = await action.execute({
              onSubmitting: () => setStatus('Confirm in wallet...'),
              onSubmitted: (hash) => setStatus(`TX submitted: ${hash.slice(0, 10)}...`),
              onConfirming: () => setStatus('Waiting for confirmation...'),
            });
            setStatus(`Event created! Vault: ${result.vaultAddress.slice(0, 10)}...`);
            setTimeout(() => {
              onClose();
              window.location.reload();
            }, 2000);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
            setError(errorMessage);
            setStep('preview');
          }
        });
        setStep('preview');
      } else {
        // Show simulation error but stay on form
        const simError = action.simulation.error?.message || 'Simulation failed';
        setError(simError);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to simulate';
      setError(errorMessage);
    } finally {
      setStatus('');
    }
  };

  const handleExecute = async () => {
    if (executeAction) {
      await executeAction();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a3a]">
          <h2 className="text-xl font-bold">Create Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-6">
              {/* Stake Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Stake Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => {
                      setStakeAmount(e.target.value);
                      setError(null); // Clear error on change
                    }}
                    className="flex-1 bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="10"
                  />
                  <select
                    value={token}
                    onChange={(e) => setToken(e.target.value as 'USDC' | 'IDRX')}
                    className="bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="USDC">USDC</option>
                    <option value="IDRX">IDRX</option>
                  </select>
                </div>
              </div>

              {/* Max Participants Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => {
                    setMaxParticipants(e.target.value);
                    setError(null);
                  }}
                  className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="50"
                  min="1"
                />
              </div>

              {/* Yield Toggle */}
              {token === 'USDC' && (
                <div className="flex items-center justify-between p-4 bg-[#12121a] rounded-xl border border-[#2a2a3a]">
                  <div>
                    <p className="font-medium text-gray-200">Enable Yield</p>
                    <p className="text-sm text-gray-400">Earn yield via Morpho</p>
                  </div>
                  <button
                    onClick={() => setUseYield(!useYield)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      useYield ? 'bg-indigo-500' : 'bg-[#2a2a3a]'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        useYield ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Error Warning (Below inputs, above button) */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                  <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-red-400">Cannot Create Event</h4>
                    <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handlePreview}
                disabled={!stakeAmount || !maxParticipants || isReadOnly || !!status}
                className="w-full btn-primary text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {status === 'Simulating...' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking Validity...
                  </>
                ) : (
                  'Preview Event'
                )}
              </button>
            </div>
          )}

          {step === 'preview' && simulation && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-[#12121a] rounded-xl p-5 border border-[#2a2a3a] space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Vault ID</span>
                  <span className="font-mono bg-[#2a2a3a] px-2 py-1 rounded text-xs text-indigo-300">
                    #{simulation.expectedVaultId?.toString()}
                  </span>
                </div>
                <div className="h-px bg-[#2a2a3a]" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Stake Amount</span>
                  <span className="font-medium text-white">{stakeAmount} {token}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Max Participants</span>
                  <span className="font-medium text-white">{maxParticipants}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Yield Enabled</span>
                  <span className={useYield ? "text-green-400 font-medium" : "text-gray-500"}>
                    {useYield && token === 'USDC' ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Est. Gas</span>
                  <span className="font-mono text-xs text-gray-500">{simulation.gasEstimate?.toString()}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('form');
                    setError(null);
                  }}
                  className="flex-1 px-4 py-3 bg-[#12121a] hover:bg-[#2a2a3a] text-gray-300 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleExecute}
                  className="flex-1 btn-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Confirm Create
                </button>
              </div>
            </div>
          )}

          {step === 'executing' && (
            <div className="text-center py-12 animate-in fade-in">
              <div className="relative w-16 h-16 mx-auto mb-6">
                 <div className="absolute inset-0 border-4 border-[#2a2a3a] rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Creating Event...</h3>
              <p className="text-sm text-gray-400">{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
