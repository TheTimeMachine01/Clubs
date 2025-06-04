import { useColorScheme } from '@/hooks/useColorScheme';
import { SplashScreen, Stack } from 'expo-router';

// Tamagui Imports 
import { TamaguiProvider, Theme } from 'tamagui';
import { config } from '../tamagui.config';

import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

// Component that uses the AuthContext to determine routing
function RootLayoutContent() {
  const { isLoadingAuth, isAuthenticated } = useAuth(); // Get auth state from context

  useEffect(() => {
    // Hide the splash screen once the initial authentication state is determined
    if (!isLoadingAuth) {
      SplashScreen.hideAsync();
    }
  }, [isLoadingAuth]); // Dependency: isLoadingAuth changes when auth check is done

  if (isLoadingAuth) {
    // While checking auth status, keep the splash screen visible
    return null;
  }

  return (
    <Stack>
      {/* Conditionally render different stacks based on authentication status */}
      {isAuthenticated ? (
        // Authenticated routes (e.g., home, dashboard)
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // Unauthenticated routes (e.g., login, signup)
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
      <Stack.Screen name="+not-found" />
      {/* You can add common modals or other global screens here */}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme(); // 'light' or 'dark'

  // Load fonts
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TamaguiProvider config={config}>
        <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
          <AuthProvider>
            <RootLayoutContent />
            <StatusBar style="auto" />
          </AuthProvider>
        </Theme>
      </TamaguiProvider>
    </ThemeProvider>
  );
}
