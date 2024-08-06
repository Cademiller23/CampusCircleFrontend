
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const focusedOptions = descriptors[state.routes[state.index].key].options;
  
    if (focusedOptions.tabBarVisible === false) {
      return null; // Hide the tab bar when tabBarVisible is false
    }
  
    return (
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 20, backgroundColor: 'transparent', borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 10, elevation: 5 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', height: 60, backgroundColor: '#ffffff', borderRadius: 30, marginHorizontal: 20, paddingVertical: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10, elevation: 5 }}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
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
                navigation.navigate(route.name);
              }
            };
  
            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };
  
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home-outline';
            } else if (route.name === 'Explore') {
              iconName = 'compass';
            } else if (route.name === 'Camera') {
              iconName = 'camera-outline';
            }
  
            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isFocused ? '#e0e0ff' : 'transparent',
                  borderRadius: 30, 
                  paddingVertical: 2,
                  paddingHorizontal: 5,
                }}
              >
                <Ionicons name={iconName} size={24} color={isFocused ? '#6366f1' : 'gray'} />
                {isFocused && (
                  <Text style={{ color: '#6366f1', fontSize: 12 }}>{label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };
  export default CustomTabBar;