
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useGlobalSearchParams } from 'expo-router';
import { setupErrorLogging } from '../utils/errorLogger';
import { AuthProvider } from '../contexts/AuthContext';

const STORAGE_KEY = 'natively-emulate-device';

export default function RootLayout() {
  const { emulate } = useGlobalSearchParams();
  const insets = useSafeAreaInsets();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setupErrorLogging();
    setIsReady(true);
  }, [emulate]);

  if (!isReady) {
    return null;
  }

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'white' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="search" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="requests" />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
