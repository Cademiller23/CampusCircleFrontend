import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Alert, Text, ScrollView, FlatList, Image, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Loading from '../Components/Loading';
import PollItem from '../Components/PollItem';
import { PollContext } from '../Components/PollContext';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const GRID_CARD_CONTAINER_PADDING_HORIZONTAL = 35;
const ITEM_MARGIN = 2;
const MAX_GRID_HEIGHT = 314;

const Divider = () => <View style={styles.divider} />;

export default function Home({ route, navigation }) {
  const [userData, setUserData] = useState(null); 
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [comments, setComments] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const [imageLoadedState, setImageLoadedState] = useState([]); 
  const itemWidth = (width - 2 * GRID_CARD_CONTAINER_PADDING_HORIZONTAL - (NUM_COLUMNS - 1) * ITEM_MARGIN) / NUM_COLUMNS;
  const isFocused = useIsFocused();
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [polls, setPolls] = useState([]);
  const { userVotes, handlePollOptionSelect, polls: contextPolls } = useContext(PollContext);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchUserData(), fetchPosts(1), fetchSavedPosts(), fetchUserTotalPosts(), fetchUserTotalLikes(), fetchComments(), fetchuserPolls(1)]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };
 
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, isFocused]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/users/me');
      if (response.ok) {
    
        const data = await response.json();
        setUserData(data);
        setProfileImage(`data:image/jpeg;base64,${data.profile_picture}`);
       
      } else {
        throw new Error('Failed to fetch user Data');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching user data.');
    }
  };
  const fetchuserPolls = async (currentPage) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/get_user_polls?page=${currentPage}`);
      if (response.ok) {
        const data = await response.json();
        if (currentPage === 1) {
          setPolls(data.polls || []);
        } else {
          setPolls(prevPolls => [...prevPolls, ...(data.polls || [])]);
        }
        setHasMore(data.has_next);
      } else {
        throw new Error('Failed to fetch user polls');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching user polls.');
    }
  };
  

  const fetchUserTotalPosts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/user_total_posts');
      if (response.ok) {
        const data = await response.json();
        setTotalPosts(data.total_posts || 0);
      } else {
        Alert.alert('Error', 'Failed to fetch total posts');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching total posts.');
    }
  };

  const fetchUserTotalLikes = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/user_total_likes');
      if (response.ok) {
        const data = await response.json();
        setTotalLikes(data.total_likes || 0);
      } else {
        Alert.alert('Error', 'Failed to fetch total likes');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching total likes.');
    }
  };

  const fetchPosts = async (currentPage) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/posts?page=${currentPage}`);
      if (response.ok) {
        const data = await response.json();
        const newPosts = data.posts || [];
        if (currentPage === 1) {
          setPosts(newPosts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...newPosts]);
        }
        setHasMore(data.has_next);
        setImageLoadedState(new Array(newPosts.length).fill(false));
      } else {
        throw new Error('Posts not found');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching posts.');
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/saved_posts');
      if (response.ok) {
        const data = await response.json();
        setSavedPhotos(data);
      } else {
        throw new Error('Saved Posts not found');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching saved posts.');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/comments/me');
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        throw new Error('Comments not found');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching comments.');
    }
  };

  const handleLoadMore = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };
  const handleLoadMorePolls = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchuserPolls(nextPage);
    }
  };

  const handleImageLoad = (index) => {
   
    setImageLoadedState(prevState => {
      const newState = [...prevState];
      newState[index] = true;
      return newState;
    });
  };

  const renderItem = ({ item, index }) => {
    const isVideo = item.content_type.startsWith('video');
    return (
      <View style={[styles.gridItem, { width: itemWidth, height: itemWidth }]}>
      

       {isVideo ? (
        <Video
        source={{ uri: item.content_url }}
        style={styles.gridVid}
        useNativeControls
        resizeMode="cover"
        onLoad={() => handleImageLoad(index)} // Ensure this callback is attached
        shouldPlay={true} // Ensure video is set to play automatically if needed
        isLooping={false} 
        onError={(e) => console.error("Video Error: ", e)}
        />
          ) : (
            <Image 
          source={{ uri: item.content_url }} 
          style={styles.gridImage}
          onLoad={() => handleImageLoad(index)} 
          />
         
          )}
      </View>
    );
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  const renderPollItem = ({ item }) => {
  if (!item || !item.id) { 
      return null;
  }
   return <PollItem poll={item} key={item.id} onSelectOption={handlePollOptionSelect} userVotes={userVotes}   />;
};

  const handleGalleryPress = () => {
    const allPhotos = [...(Array.isArray(posts) ? posts : []), ...(Array.isArray(savedPhotos) ? savedPhotos : [])];
    navigation.navigate('GalleryPage', { photos: allPhotos });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.headerProfileContainer}>
          {isLoading ? (
            <Loading />
          ) : userData ? (
            <View style={styles.Homeheader}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                onError={(e) => console.error("Image loading error: ", e.nativeEvent.error)}
              />
              <View style={styles.userInfoContainer}>
                <Text style={styles.username}>{userData.username}</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Likes:</Text>
                    <Text style={styles.statValue}>{totalLikes}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Posts:</Text>
                    <Text style={styles.statValue}>{totalPosts}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <Text>No user data available</Text>
          )}
        </View>
        <View style={[styles.gridCardContainer, { maxHeight: MAX_GRID_HEIGHT }]}>
          <TouchableOpacity style={styles.galleryHeader} onPress={handleGalleryPress}>
            <Text style={styles.galleryText}>Gallery (Posts & Saved Posts)...</Text>
            <Entypo name="arrow-with-circle-right" size={24} color='black' />
          </TouchableOpacity>
          <Divider />
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.flatListContentContainer}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={hasMore && <ActivityIndicator size="large" color="#007AFF" />}
            ListEmptyComponent={!isLoading && <Text style={styles.noPostsText}>No Posts Yet. Start Sharing!</Text>}
          />
        </View>
        <View style={styles.gridCardContainer}>
          <TouchableOpacity style={styles.galleryHeader} onPress={() => navigation.navigate('AllComments', { comments })}>
            <Text style={styles.galleryText}>All Comments...</Text>
            <Entypo name="arrow-with-circle-right" size={24} color='black' />
          </TouchableOpacity>
          <Divider />
          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
          ) : (
            <FlatList
              data={comments}
              renderItem={renderCommentItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.flatListContentContainer}
              ListEmptyComponent={() => <Text style={styles.noPostsText}>No Comments Yet</Text>}
            />
          )}
        </View> 
        <View style={styles.gridCardContainer}>
          <TouchableOpacity style={styles.galleryHeader}>
            <Text style={styles.galleryText}>All Polls...</Text>
            <Entypo name="arrow-with-circle-right" size={24} color='black' />
          </TouchableOpacity>
          <Divider />
          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
          ) : (
            <FlatList
              data={polls}
              renderItem={renderPollItem}
              keyExtractor={(item, index) => `poll_${index}`}
              onEndReached={handleLoadMorePolls}
              onEndReachedThreshold={0.1}
              ListFooterComponent={hasMore && <ActivityIndicator size="large" color="#007AFF" />}
              ListEmptyComponent={<Text>No polls available.</Text>}
            />
          )}
        </View> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create ({
    chevronIcon: {
        marginLeft: 'auto',
        paddingHorizontal: 10,
    },
    commentItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    loadingIndicator: {
        marginTop: 20,
    },
    commentText: {
        fontSize: 16,
    },
    postReference: {
        fontSize: 12,
        color: '#777',
        marginTop: 5,
    },
    noPostsText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 16,
        color: '#666'
    },
    Homeheader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16
    },
    profileImage: {
        width: 80,
        height: 80, 
        borderRadius: 40,
        marginRight: 16,
        alignSelf: 'center'
    },
    userInfoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontSize: 24,
        fontFamily: 'san fransisco',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 3,
        marginBottom: 8,
    },
    statsContainer: {
        flexDirection: 'row',
    },
    statItem: {
        marginRight: 20,
    },
    statLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    gridVid: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover'
    },
    container: {
        flex: 1,
        marginTop: 40,
        backgroundColor: 'white'
    },
    galleryHeader: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 4
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'neutral-200',
    },
    galleryText: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerProfileContainer: {  
        height: 200,
        backgroundColor: '#f2f2f2',
        marginHorizontal: 12,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },  
    gridCardContainer: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        margin: 12,
        borderRadius: 20,
        padding: 20,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    profilePhotoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    rowHeader: {
        flexDirection: 'row',
    },
    rowHeaderText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#6366f1',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    icon: {
        paddingHorizontal: 20,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 3,
    },
    gridItem: {
        marginBottom: ITEM_MARGIN,
        marginHorizontal: ITEM_MARGIN / 2,
        borderRadius: 10,
        overflow: 'hidden',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    flatListContentContainer: {
        paddingHorizontal: ITEM_MARGIN / 2,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalImage: {
        width: '90%',
        height: '80%',
        resizeMode: 'contain',
    },
    closeButton: {
        marginTop: 20,
        padding: 1
    },
});