# ATFi Demo DApp

Frontend demo application showcasing the ATFi SDK capabilities.

## Features

- **Events List** - Browse all commitment vaults
- **Create Event** - Create new events with simulation preview
- **Register** - Join events by staking tokens
- **Dashboard** - View your events, registrations, and claimable rewards
- **Event Details** - Full event info with actions (start, settle, claim)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- wagmi + viem
- ATFi SDK

## SDK Integration

The app uses the ATFi SDK via a custom hook:

```typescript
import { useATFiSDK } from './hooks/useATFiSDK';

function MyComponent() {
  const { sdk, isReadOnly } = useATFiSDK();

  // Read data (works in read-only mode)
  const events = await sdk.getAllEvents();

  // Write operations (requires wallet)
  const action = await sdk.register({ vaultAddress: '0x...' });
  if (action.simulation.success) {
    await action.execute({
      onSubmitting: () => setStatus('Submitting...'),
    });
  }
}
```

## Notes

This is a frontend-only demo. In production, you would need:
- Backend for participant verification (attendance checking)
- Database for event metadata (names, descriptions, images)
- Authentication for organizers
