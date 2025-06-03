import React from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { Button, Stack, Text } from 'tamagui';


export default function ProfileScreen() {

  const colorScheme = useColorScheme();

  const toogleColorScheme = () => {
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    Appearance.setColorScheme(newColorScheme);
  }

  return (
    <Stack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
      <Text fontSize="$6" color="$color" mb="$4">
        Profile Tab
      </Text>
      
      <Text fontSize="$4" color="$color" mb="$6">
        Current Theme: {colorScheme?.toUpperCase() || 'Unknown'}
      </Text>

      <Button
        onPress={toogleColorScheme}
        size="$4"
        theme={colorScheme === 'dark' ? 'light' : 'dark'}
      >
        <Button.Text>
          Switch to {colorScheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button.Text>
      </Button>

    </Stack>
  );
}