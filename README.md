# Mobile POS & Inventory Management App

A production-grade mobile Point of Sale (POS) and Inventory Management application built with Expo (React Native) that connects to a Supabase backend.

## Features

- 📱 **Cross-Platform**: Works on both iOS and Android
- 🛒 **Point of Sale**: Fast checkout with barcode scanning
- 📦 **Inventory Management**: Real-time stock tracking across multiple locations
- 📊 **Analytics**: Comprehensive sales and inventory reports
- 👥 **Customer Management**: Track customers and loyalty points
- 💰 **Layaway Orders**: Support for partial payments and reservations
- 🌙 **Dark Mode**: Full dark mode support with system preference detection
- 🔍 **Fast Search**: Algolia-powered product and inventory search
- 💾 **Offline Support**: MMKV for fast local storage

## Tech Stack

- **Framework**: Expo SDK (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Server State**: TanStack Query (React Query v5)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Search**: Algolia
- **UI Library**: React Native Paper (Material Design 3)
- **Local Storage**: React Native MMKV
- **Charts**: Victory Native
- **Package Manager**: Bun

## Prerequisites

- Node.js 18+ or Bun
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Supabase account and project
- Algolia account

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

   Update the following variables:
   - `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `EXPO_PUBLIC_ALGOLIA_APP_ID`: Your Algolia app ID
   - `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY`: Your Algolia search-only API key

4. **Create a development build** (Required for MMKV and camera features)
   ```bash
   # Install EAS CLI
   npm install -g eas-cli

   # Login to Expo
   eas login

   # Create development build for iOS
   eas build --profile development --platform ios

   # Create development build for Android
   eas build --profile development --platform android
   ```

5. **Run the app**
   ```bash
   # Start the development server
   bun start

   # Run on iOS
   bun run ios

   # Run on Android
   bun run android
   ```

## Project Structure

```
/app                          # Expo Router screens
  /(auth)                     # Authentication screens
  /(tabs)                     # Main tab navigation
  /orders, /products, etc.    # Feature screens
/components                   # Reusable UI components
  /pos, /orders, /inventory   # Feature-specific components
  /common, /ui                # Shared components
/lib                          # Core utilities
  /supabase                   # Supabase client & helpers
  /algolia                    # Algolia search
  /storage                    # MMKV storage
  /api                        # API call functions
/stores                       # Zustand stores
/hooks                        # React Query hooks & custom hooks
/types                        # TypeScript interfaces
/utils                        # Utility functions
/constants                    # App constants
```

## Development

### Running Tests
```bash
bun test
```

### Type Checking
```bash
bun run type-check
```

### Linting
```bash
bun run lint
```

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `EXPO_PUBLIC_ALGOLIA_APP_ID` | Algolia application ID | Yes |
| `EXPO_PUBLIC_ALGOLIA_SEARCH_KEY` | Algolia search-only API key | Yes |
| `EXPO_PUBLIC_ALGOLIA_PRODUCTS_INDEX` | Algolia products index name | No (default: products) |
| `EXPO_PUBLIC_ALGOLIA_INVENTORY_INDEX` | Algolia inventory index name | No (default: inventory) |
| `EXPO_PUBLIC_CURRENCY_SYMBOL` | Currency symbol | No (default: KSh) |
| `EXPO_PUBLIC_CURRENCY_CODE` | Currency code | No (default: KES) |
| `EXPO_PUBLIC_TAX_RATE` | Default tax rate percentage | No (default: 0) |
| `EXPO_PUBLIC_LOYALTY_POINTS_PER_CURRENCY` | Points per currency unit | No (default: 100) |

## Key Features

### Point of Sale
- Fast product search with Algolia
- Barcode scanning for quick checkout
- Multiple payment methods (Cash, M-Pesa, Card, Bank Transfer)
- Split payments support
- Discount codes and item-level discounts
- Customer selection and creation
- Digital receipts

### Layaway Orders
- Create layaway orders with deposit
- Track payment progress
- Automatic inventory reservation
- Proportional revenue calculation
- Payment reminders

### Inventory Management
- Multi-location stock tracking
- Stock adjustments (damage, return, loss, found)
- Stock movement history
- Low stock alerts
- Reorder point management
- Stock transfers between locations

### Customer Management
- Customer profiles
- Order history
- Loyalty points tracking
- Customer search

### Analytics
- Sales dashboard
- Revenue and profit tracking
- Top selling products
- Payment method breakdown
- Category sales analysis
- Date range filtering

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@example.com or open an issue in the repository.
