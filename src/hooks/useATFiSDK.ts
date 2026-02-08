import { useMemo } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { ATFiSDK } from 'atfi';

export function useATFiSDK() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const sdk = useMemo(() => {
    if (!publicClient) return null;

    const client = publicClient;

    if (walletClient) {
      return new ATFiSDK(client, walletClient);
    }

    return ATFiSDK.readOnly(client);
  }, [publicClient, walletClient]);

  return {
    sdk,
    isReadOnly: !walletClient,
  };
}


