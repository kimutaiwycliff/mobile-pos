// App Index - Redirect to tabs

import { Redirect } from 'expo-router';

export default function Index() {
    // For now, redirect to tabs (will add auth check later)
    return <Redirect href="/(tabs)" />;
}
