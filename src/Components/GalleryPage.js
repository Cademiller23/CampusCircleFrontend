import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, ActivityIndicator, Dimensions, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');
const VISIBLE_POST_WIDTH = width * 0.9; // 90% of the screen width is visible
const SIDE_VISIBLE_WIDTH = width * 0.05; // 5% of the screen width for the sliver of adjacent posts
const AUTO_SCROLL_INTERVAL = 3000; // Time interval for automatic transition (in milliseconds)

const GalleryPage = ({ route, navigation }) => {
  const { photos } = route.params;
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const currentIndex = useRef(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const autoScroll = setInterval(() => {
      if (!isVideoPlaying) {
        if (currentIndex.current < photos.length - 1) {
          currentIndex.current++;
        } else {
          currentIndex.current = 0;
        }
        flatListRef.current?.scrollToIndex({ index: currentIndex.current, animated: true });
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(autoScroll);
  }, [photos.length, isVideoPlaying]);

  const handleManualScroll = (direction) => {
    if (direction === 'left' && currentIndex.current < photos.length - 1) {
      currentIndex.current++;
    } else if (direction === 'right' && currentIndex.current > 0) {
      currentIndex.current--;
    }
    flatListRef.current?.scrollToIndex({ index: currentIndex.current, animated: true });
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85], // Scale down for adjacent posts, centered post at full scale
    });

    return (
      <Animated.View
      style={[
        styles.mediaContainer,
        {
          transform: [{ scale }],
        },
      ]}
    >
      {item.content_type.startsWith('video') ? (
        <Video
          source={{ uri: `data:${item.content_type};base64,${item.content_url}` }}
          style={styles.media}
          useNativeControls
          resizeMode="cover"
          onPlaybackStatusUpdate={(status) => setIsVideoPlaying(status.isPlaying)}
        />
      ) : (
        <Image
          source={{ uri: `data:${item.content_type};base64,${item.content_url}` }}
          style={styles.media}
        />
      )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {photos.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        />
      ) : (
        <Animated.FlatList
          ref={flatListRef}
          data={photos}
          keyExtractor={(item, index) => item.id?.toString() ?? index.toString()}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          snapToAlignment="center"
          contentContainerStyle={{ paddingHorizontal: SIDE_VISIBLE_WIDTH }}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
        />
      )}
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.navButton, { left: 20 }]}
          onPress={() => handleManualScroll('right')}
        >
          <Ionicons name="chevron-back" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, { right: 20 }]}
          onPress={() => handleManualScroll('left')}
        >
          <Ionicons name="chevron-forward" size={32} color="white" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close-circle" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
  },
  container: {
    flex: 1,
    paddingLeft: 10,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    width: VISIBLE_POST_WIDTH,
    height: height * 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SIDE_VISIBLE_WIDTH / 2,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: height * 0.05, // Add top margin to further center the image vertically
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    zIndex: 2,
    padding: 10,
  },
});

export default GalleryPage;