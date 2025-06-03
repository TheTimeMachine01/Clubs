import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur'; // Optional: for a frosted glass effect
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Stack } from 'tamagui';

import { Colors } from '@/constants/Colors'; // Assuming this path and structure are correct
import { useColorScheme } from '@/hooks/useColorScheme';

interface MyFloatingTabBarProps extends BottomTabBarProps { }

function MyFloatingTabBar({ state, descriptors, navigation }: MyFloatingTabBarProps) {
  const colorScheme = useColorScheme(); // Get the current color scheme (light/dark)
  const isDark = colorScheme === 'dark';

  // Determine background color based on theme
  const tabBarBackgroundColor = isDark
    ? 'rgba(0, 0, 0, 0.7)' // Darker, semi-transparent for dark mode
    : 'rgba(255, 255, 255, 0.9)'; // Lighter, semi-transparent for light mode


  // Determine active and inactive tint colors based on theme
  const activeTintColor = Colors[colorScheme ?? 'light'].tint; // Use your app's defined tint color
  const inactiveTintColor = isDark ? '#BBBBBB' : '#666666'; // Adjust for better contrast in dark mode

  /**
   * Returns the appropriate MaterialCommunityIcons name based on the route and focus state.
   * This function centralizes icon selection for the custom tab bar.
   * @param routeName The name of the current tab route.
   * @param focused Boolean indicating if the tab is currently focused.
   * @returns The MaterialCommunityIcons string name.
   */

  const getIconName = (routeName: string, focused: boolean): string => {
    switch (routeName) {
      case 'home/index':
        return focused ? 'home' : 'home-outline';
      case 'events/index':
        // Using 'magnify' as per your original code, consider 'calendar-month' or 'bell'
        return focused ? 'magnify' : 'magnify';
      case 'discover/index':
        // Using 'magnify' as per your original code, consider 'compass' or 'lightbulb-on'
        return focused ? 'magnify' : 'magnify';
      case 'profile/index':
        return focused ? 'account' : 'account-outline';
      default:
        // Fallback icon for any unhandled routes
        return 'information-outline';
    }
  };


  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      {/* Blur effect for the floating background */}
      <BlurView
        intensity={90} // Adjust blur intensity as needed
        tint={isDark ? 'dark' : 'light'} // Dynamic tint based on theme
        style={StyleSheet.absoluteFillObject} // Makes BlurView cover its parent
      />

      <View style={[styles.tabBarContainer, { backgroundColor: tabBarBackgroundColor }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Get icon based on route name (customize this)
          const getIconName = (routeName: string, focused: boolean) => {
            switch (routeName) {
              case 'home/index':
                return focused ? 'home' : 'home-outline';
              case 'events/index':
                return focused ? 'compass' : 'compass-outline';
              case 'discover/index':
                return focused ? 'magnify' : 'magnify';
              case 'profile/index':
                return focused ? 'account' : 'account-outline';
              default:
                return 'information-circle-outline';
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabBarButton}
            >
              <MaterialCommunityIcons
                name={getIconName(route.name, isFocused)}
                size={24} // Icon size
                color={isFocused ? activeTintColor : inactiveTintColor} // Icon color
              />
              <Text
                style={{
                  color: isFocused ? activeTintColor : inactiveTintColor,
                  fontSize: 10,
                  marginTop: 2, // Small spacing between icon and text
                }}
              >
                {label}.
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const notification = null;

  const openNotificationPannel = () => { };

  const buttonSize = '$12'; // Adjust as needed

  return (

    <>
      <Stack paddingTop={'$6'} backgroundColor='$background'>
        <Stack
          // flex={1}
          flexDirection='row'
          backgroundColor='$background'
          padding='$2'
          width={'100%'}
          justifyContent='space-between'
          alignItems='normal'

        >
          <Button
            onPress={openNotificationPannel}
            width={buttonSize}
            height={buttonSize}
            circular

            theme={colorScheme === 'dark' ? 'light' : 'dark'}
          >
            <Ionicons name='arrow-back-outline' size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </Button>

          <Button
            onPress={openNotificationPannel}
            width={buttonSize}
            height={buttonSize}
            circular
            theme={colorScheme === 'dark' ? 'light' : 'dark'}
          >
            {notification === null ? (
              <MaterialCommunityIcons
                name='bell'
                size={24} // Icon size
                color={colorScheme === 'dark' ? 'white' : 'black'} // Icon color
              />
            ) : (
              <MaterialCommunityIcons
                name='bell-badge'
                size={24} // Icon size
                color={colorScheme === 'dark' ? 'orange' : 'red'} // Icon color
              />
            )}


          </Button>
        </Stack>
      </Stack>

      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <MyFloatingTabBar {...props} />}
      >
        <Tabs.Screen
          name="home/index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="events/index"
          options={{
            title: 'Events',
          }}
        />
        <Tabs.Screen
          name="discover/index"
          options={{
            title: 'Discover',
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: 'Profile',
          }}
        />
      </Tabs>

    </>


  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent', // Make sure SafeAreaView itself is transparent
    // This padding is for the floating effect
    paddingBottom: 20, // Adjust as needed to lift it off the bottom
    paddingHorizontal: 20, // Adjust for horizontal floating
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor is now dynamic in MyFloatingTabBar
    borderRadius: 30, // Circular boundaries for the entire bar
    height: 60, // Adjust height as needed
    overflow: 'hidden', // Ensures content stays within rounded corners
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  tabBarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
});
