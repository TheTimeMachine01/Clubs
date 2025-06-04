import { useApiTest } from '@/hooks/useApiTest';
import React from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { Button, Spinner, Stack, Text, YStack } from 'tamagui';


export default function ProfileScreen() {

  const colorScheme = useColorScheme();

  const toogleColorScheme = () => {
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    Appearance.setColorScheme(newColorScheme);
  }

  const { data: users, isLoading: isLoadingUsers, error: errorUsers, fetchData: fetchUsers } = useApiTest({ endpoint: '/users', triggerOnAuth: true });

  return (
    <Stack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">

      <Text fontSize="$6" fontWeight="bold" color="$color">Users Data Test (`/users`)</Text>
      <Button onPress={fetchUsers} size="$3" theme="blue">
        <Text>Refetch Users</Text>
      </Button>

      {isLoadingUsers ? (
        <YStack alignItems="center" space="$2" mt="$3">
          <Spinner size="small" color="$blue9" />
          <Text color="$color">Loading users...</Text>
        </YStack>
      ) : errorUsers ? (
        <Text color="$red9" textAlign="center">Error: {errorUsers}</Text>
      ) : users ? (
        <YStack space="$2" width="100%">
          <Text color="$color">Found {Array.isArray(users) ? users.length : 'N/A'} users:</Text>
          {Array.isArray(users) ? (
            users.map((user: any) => ( // Adjust 'any' to a specific User type if you have one
              <Text key={user.id || user.email} color="$color" fontSize="$3">
                - {user.fullName} (ID: {user.id})
              </Text>
            ))
          ) : (
            <Text color="$color">Users data is not an array. Raw: {JSON.stringify(users)}</Text>
          )}
        </YStack>
      ) : (
        <Text color="orange">No user data fetched yet.</Text>
      )}



    </Stack>
  );
}