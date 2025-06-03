import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Appearance, Dimensions, useColorScheme } from 'react-native';
import { Button, Stack, Text, YStack } from 'tamagui';


const { height, width } = Dimensions.get('window');


export default function SettingScreen() {

  const colorScheme = useColorScheme();

  const toogleColorScheme = () => {
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    Appearance.setColorScheme(newColorScheme);
  }

  const buttonSize = '$12'; // Adjust as needed

  return (


    <Stack flex={1} paddingTop={'$6'} flexWrap='wrap' alignItems="center" backgroundColor="$background">

      <YStack
        backgroundColor='$background'
        padding='$2'
        width={'100%'}
        justifyContent="center"
        alignItems='flex-end'

      >
        <Button
          onPress={toogleColorScheme}
          width={buttonSize}
          height={buttonSize}
          circular

          theme={colorScheme === 'dark' ? 'light' : 'dark'}
        >
          {colorScheme === 'dark' ? (
            <Ionicons name='moon' size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
          ) : (
            <Ionicons name='sunny' size={24} color={colorScheme === 'light' ? 'black' : 'white'} />
          )}
        </Button>
      </YStack>

      <YStack
        flex={1}
        justifyContent="center"
        alignItems='center'
      >

        <Text fontSize="$6" color="$color" mb="$4">
          Setting Tab
        </Text>

        <Text fontSize="$4" color="$color" mb="$6">
          Current Theme: {colorScheme?.toUpperCase() || 'Unknown'}
        </Text>

      </YStack>



    </Stack>
  );
}