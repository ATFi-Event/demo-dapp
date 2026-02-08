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
        setError(action.simulation.error?.message || 'Simulation failed');
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
      <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl w-full max-w-md">
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Stake Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="flex-1 bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="10"
                  />
                  <select
                    value={token}
                    onChange={(e) => setToken(e.target.value as 'USDC' | 'IDRX')}
                    className="bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USDC">USDC</option>
                    <option value="IDRX">IDRX</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full bg-[#12121a] border border-[#2a2a3a] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="50"
                />
              </div>

              {token === 'USDC' && (
                <div className="flex items-center justify-between p-4 bg-[#12121a] rounded-lg border border-[#2a2a3a]">
                  <div>
                    <p className="font-medium">Enable Yield</p>
                    <p className="text-sm text-gray-400">Earn yield via Morpho</p>
                  </div>
                  <button
                    onClick={() => setUseYield(!useYield)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      useYield ? 'bg-indigo-500' : 'bg-[#2a2a3a]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        useYield ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePreview}
                disabled={!stakeAmount || !maxParticipants || isReadOnly}
                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
              >
                {status || 'Preview'}
              </button>
            </div>
          )}

          {step === 'preview' && simulation?.success && (
            <div className="space-y-4">
              <div className="p-4 bg-[#12121a] rounded-lg border border-[#2a2a3a] space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vault ID</span>
                  <span className="font-mono">#{simulation.expectedVaultId?.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stake Amount</span>
                  <span>{stakeAmount} {token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Participants</span>
                  <span>{maxParticipants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Yield Enabled</span>
                  <span>{useYield && token === 'USDC' ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Est. Gas</span>
                  <span className="font-mono text-sm">{simulation.gasEstimate?.toString()}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleExecute}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Create Event
                </button>
              </div>
            </div>
          )}

          {step === 'executing' && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {status}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
