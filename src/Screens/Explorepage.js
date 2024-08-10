import React, { useState, useRef, useEffect, useContext, useCallback } from "react";
import base64 from 'react-native-base64';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Button,
  ScrollView,
  ActivityIndicator,
  Alert, Image,
  Animated
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal"; // Use react-native-modal for additional features

import { Video } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import Loading from "../Components/Loading";
import { AntDesign, FontAwesome, FontAwesome5, FontAwesome6, Fontisto, MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import PollModal from "../Components/PollModal";
import PollItem from "../Components/PollItem";
import { PollContext } from '../Components/PollContext';

const ExplorePage = () => {
  const [data, setData] = useState(null);
  const [votes, setVotes] = useState({});
  const [posts, setPosts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [loading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [postComments, setPostComments] = useState({}); // Comments for each post
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-50)).current;
  const [savedphotos, setSavedPhotos] = useState([]);
  const [isPollModalVisible, setPollModalVisible] = useState(false);
  const likeAnimationRef = useRef(null);
  const dislikeAnimationRef = useRef(null);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showDislikeAnimation, setShowDislikeAnimation] = useState(false);
  const [currentPagePosts, setCurrentPagePosts] = useState(1);
  const [currentPagePolls, setCurrentPagePolls] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMorePolls, setHasMorePolls] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const { handlePollOptionSelect, userVotes, polls, setPolls} = useContext(PollContext);
  const [isViewingPosts, setIsViewingPosts] = useState(true); 
  // POSTS AND POLLS

  const loadMoreData = () => {
    if (isViewingPosts) {
      fetchPosts();
    } else {
      fetchPolls();
    }
  };

  const fetchPolls = useCallback(async () => {
    if (loadingPolls || !hasMorePolls) return;
    setLoadingPolls(true);
    try {
        const response = await fetch(`http://127.0.0.1:5000/fetch_other_polls?page=${currentPagePolls}&per_page=10`);
        if (response.ok) {
          const data = await response.json();
  
          if (data.polls && data.polls.length > 0) {
            // Merge new polls with existing ones, updating if they already exist
            setPolls((prevPolls) => {
              const updatedPolls = prevPolls.map(existingPoll => {
                const matchingNewPoll = data.polls.find(newPoll => newPoll.id === existingPoll.id);
                return matchingNewPoll ? matchingNewPoll : existingPoll; 
              });
              return [...updatedPolls, ...data.polls.filter(newPoll => !prevPolls.some(existingPoll => existingPoll.id === newPoll.id))];
            });
  
            setCurrentPagePolls((prev) => prev + 1);
            setHasMorePolls(data.has_next);
          }
        } else {
            throw new Error('Failed to fetch polls');
        }
    } catch (error) {
        console.error("Error fetching polls:", error.message);
        Alert.alert('Error', 'Failed to load polls. Please try again.');
    }
    setLoadingPolls(false);
}, [currentPagePolls, hasMorePolls, loadingPolls]);

  const resetStateForNewCategory = () => {
    setPosts([]);
    setPolls([]);
    setCurrentPagePosts(1);
    setCurrentPagePolls(1);
    setHasMorePosts(true);
    setHasMorePolls(true);
    setLoadingPosts(false);
    setLoadingPolls(false);
  };

  useEffect(() => {
    resetStateForNewCategory();
    if (isViewingPosts) {
      fetchPosts();
  } else {
      fetchPolls();
  }
  }, [isViewingPosts, selectedCategoryFilter]);

 
  const fetchPosts = useCallback(async () => {
    if (loadingPosts || !hasMorePosts) return;
    setLoadingPosts(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/explore_posts?page=${currentPagePosts}&per_page=10&category=${selectedCategoryFilter}`);
      if (response.ok) {
        const data = await response.json();
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
        setCurrentPagePosts((prev) => prev + 1);
        setHasMorePosts(data.has_next);
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert('Error', 'Failed to load posts. Please try again.');
    }
    setLoadingPosts(false);
  }, [currentPagePosts, hasMorePosts, loadingPosts, selectedCategoryFilter]);

 

 // Handle post actions
 const handleLike = async (postId) => {
  
  try {
    const response = await fetch(`http://127.0.0.1:5000/like_post/${postId}`, { method: "POST" });
    const data = await response.json();

    if (response.ok) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, userHasLiked: true, userHasDisliked: false, likeCount: data.like_count }
            : post
        )
      );
    } else {
      Alert.alert("Error", data.message || "An error occurred while liking the post.");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "An error occurred while liking the post.");
  } finally {
    setShowLikeAnimation(true)
    setTimeout(() => setShowLikeAnimation(false), 2500);
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Wait 2.5 seconds
    likeAnimationRef.current?.reset();
  }
};

const handleDislike = async (postId) => {

  try {
    const response = await fetch(`http://127.0.0.1:5000/dislike_post/${postId}`, { method: "POST" });
    const data = await response.json();

    if (response.ok) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, userHasLiked: false, userHasDisliked: true, likeCount: data.like_count }
            : post
        )
      );
    } else {
      Alert.alert("Error", data.message || "An error occurred while disliking the post.");
    }
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "An error occurred while disliking the post.");
  } finally {
    setShowDislikeAnimation(true);
    setTimeout(() => setShowDislikeAnimation(false), 2500);
    await new Promise((resolve) => setTimeout(resolve, 2500)); // Wait 2.5 seconds
    dislikeAnimationRef.current?.reset();
  }
};


const handlePollSubmit = async (pollData) => {
  try {
    const response = await fetch('http://127.0.0.1:5000/create_poll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pollData),
    });
    if (response.ok) {
      const data = await response.json();
      setPolls(prevPolls => [data, ...prevPolls]);
      Alert.alert('Success', 'Poll created successfully');
    } else {
      throw new Error('Failed to create poll');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'An error occurred while creating the poll.');
  }
};

const renderPollItem = ({ item }) => {
console.log("Poll Item:", item); 
if (!item || !item.id) {
  console.error("Poll Item is undefined or missing an ID", item);
  return null;  // Return null if the item is invalid to avoid the crash
}

return (
  <PollItem poll={item} key={`poll-${item.id}`}   />
);
};




  const calculateTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const differenceInSeconds = Math.floor((now - postTime) / 1000);
    const minutes = Math.floor(differenceInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `Just now`;
    }
  };

  const handleCategoryModal = () => {
    if (!isViewingPosts) {
      Alert.alert("No Categories", "Sorry, there are no categories for polls.");
      return;
    }

    setCategoryModal(true);
    Animated.sequence([
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeCategoryModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setCategoryModal(false);
      fadeAnim.setValue(0);
      translateYAnim.setValue(-50);
    });
  };

  const commentListRef = useRef(null);
 
  useFocusEffect(
    React.useCallback(() => {
      setSelectedCategoryFilter("all"); // Reset to "all" every time the page is focused
    }, []) // Empty dependency array: Run only once when component mounts
  );
 


 // Fisher-Yates Shuffle (to randomize posts)
 const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
 };
 


 const fetchCommentsForPost = useCallback(async (postId) => {
  setIsLoadingComments(true);
  try {
    const response = await fetch(`http://127.0.0.1:5000/newComments/${postId}`);
    if (response.ok) {
      const data = await response.json();
      setPostComments(prev => ({ ...prev, [postId]: data }));
    } else if (response.status === 404) {
      setPostComments(prev => ({ ...prev, [postId]: [] }));  // Set an empty array if no comments
    } else {
      throw new Error('Failed to fetch comments');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'An error occurred while fetching comments.');
  } finally {
    setIsLoadingComments(false);
  }
}, []); 
  // Handle Comments USE Effect
  useEffect(() => {
    if (selectedPost) {
      setModalVisible(true);
      fetchCommentsForPost(selectedPost.id);
    } else {
      setModalVisible(false);
    }
  }, [selectedPost, fetchCommentsForPost]); 


  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() === "" || !selectedPost) return;

    try {
      const response = await fetch('http://127.0.0.1:5000/create_comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: selectedPost.id,
          text: newComment,
        }),
      });
      if (response.ok) {
        const newCommentData = await response.json();

            // Safely update the comments for the specific post
            setPostComments(prev => ({
                ...prev,
                [selectedPost.id]: [
                    ...(Array.isArray(prev[selectedPost.id]) ? prev[selectedPost.id] : []),
                    newCommentData
                ]
            }));
        setNewComment(""); // Clear the input field
       
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while adding the comment.');
    }
  }, [newComment, selectedPost]);
        
  const handleSave = async (post) => {
    try {
      
      const response = await fetch(`http://127.0.0.1:5000/save_post/${post.id}`, {
        method: 'POST',
      });
      if(response.ok) {
        setSavedPhotos((prevSavedPhotos) => [...prevSavedPhotos, post])
        Alert.alert('Success', 'Post saved successfully!');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to save post.');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while saving the post.');
    }
      
  };


  const renderPostItem = ({ item }) => {
    const voteStatus = votes[item.id];
   
   
    const username = item.username || "Unknown User"; 
    const timeAgo = calculateTimeAgo(item.timestamp); // Calculate time ago
    return (
      
      <View key={`post-${item.id}`} style={styles.postContainer}>
       <View style={styles.imageContainer}>
       {item.content_type.startsWith('image') ? (
        <Image
          source={{ uri: item.content_url }}
          style={styles.video}
          resizeMode="cover"
        />
        ) : (
          <Video
          source={{ uri: item.content_url }}
          style={styles.video}
          useNativeControls
          resizeMode="cover"
        />
      )}
         <Text style={styles.username}>@{username}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.footerContainer}>
        <Text style={styles.timeStamp}>{timeAgo}</Text>
        <Text style={styles.likeCount}>Liked: {item.likeCount}</Text>
      </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => handleSave(item)}
        >
          <Entypo name="bookmark" size={23} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => setSelectedPost(item)}
        >
          <Fontisto name="comments" size={23} color="black" />
        </TouchableOpacity>
        <View style={styles.voteBar}>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleLike(item.id)}
            disabled={item.userHasLiked}
          >
            <MaterialCommunityIcons
              name="plus-circle-multiple"
              size={24}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleDislike(item.id)}
            disabled={item.userHasDisliked}
          >
            <MaterialCommunityIcons
              name="minus-circle-multiple"
              size={24}
              color="black"            />
          </TouchableOpacity>
         
        </View>
      </View>
    </View>
  );
};
  const handleCategoryFilterPress = (category) => {

    if (!isViewingPosts) {
      Alert.alert("No Categories", "Sorry, there are no categories for polls.");
      return;
    }
  
    console.log("Selected Category:", category.name);
    setSelectedCategoryFilter(category.name);
    closeCategoryModal();
   
  };
  

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentText}>{item.text}</Text>
      <Text style={styles.commentUsername}>@{item.username}</Text>
    </View>
  );


  return (
    <View style={{ flex: 1, padding: 20 }}>
       {showLikeAnimation && (
      <LottieView
        ref={likeAnimationRef}
        source={require('../../assets/R_F.json')}
        style={styles.lottieAnimation}
        loop={false} 
        speed={0.6}
        autoPlay />
        )}
          {showDislikeAnimation && (
         <LottieView
        ref={dislikeAnimationRef}
        source={require('../../assets/T_D.json')}
        style={styles.lottieAnimation}
        loop={false}
        speed={0.6}
        autoPlay
      />
      )}
     <View style={styles.headingExplore}>
     <TouchableOpacity style={styles.menuIcon} onPress={() => setPollModalVisible(true)}>
       <FontAwesome6 name="square-poll-vertical" size={28} color="black" />
      </TouchableOpacity>
      <TouchableOpacity 
          style={[styles.switchButton, isViewingPosts && styles.activeSwitchButton]}
          onPress={() => setIsViewingPosts(true)}
        >
          <Text style={[styles.switchButtonText, isViewingPosts && styles.activeSwitchButtonText]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.switchButton, !isViewingPosts && styles.activeSwitchButton]}
          onPress={() => setIsViewingPosts(false)}
        >
          <Text style={[styles.switchButtonText, !isViewingPosts && styles.activeSwitchButtonText]}>Polls</Text>
        </TouchableOpacity>

      <TouchableOpacity style={styles.menuIcon} onPress={handleCategoryModal}>
       <SimpleLineIcons name="menu" size={24} color="black" />
      </TouchableOpacity>
     
     
      </View>
      <PollModal isVisible={isPollModalVisible} onClose={() => setPollModalVisible(false)} onSubmit={handlePollSubmit} />
      <Modal transparent={true} isVisible={categoryModal} animationType="fade"
       >
        <View style={styles.theCategoryModel}>
        <Animated.View style={{ 
              opacity: fadeAnim, 
              transform: [{ translateY: translateYAnim }] 
            }}>
        <Text style={styles.modalTitle}>Select Category</Text>
        <View style={styles.categoryList}>
        {[
         { name: 'So Frat', icon: 'beer-mug-empty' },
         { name: 'Laughs', icon: 'face-laugh-squint' },
         { name: 'Education', icon: 'book' },
         { name: 'Football', icon: 'football' },
         { name: 'Dining Hall Fails', icon: 'utensils' },
         { name: 'Need Advice', icon: 'question' },
         { name: 'Trojan Talk', icon: 'comments-dollar' },
         { name: 'all', icon: 'list' },
        
      ].map((category) => (
            <TouchableOpacity
                key={category.name}
                onPress={() => handleCategoryFilterPress(category)}
                style={[styles.categoryButton, selectedCategoryFilter === category.name && styles.selectedCategoryButton]}
            >
                 <View style={styles.categoryItem}>
              <Text style={styles.categoryButtonText}>{category.name}</Text>
              <FontAwesome6 name={category.icon} size={20} color="black" style={styles.categoryIcon} />
            </View>
            </TouchableOpacity>
        ))}
        </View>
        <Button title="Close" onPress={closeCategoryModal} />
        </Animated.View>
    </View>
        </Modal> 
           
        {isViewingPosts ? (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          decelerationRate="normal"
          nestedScrollEnabled={true}
          ListFooterComponent={loadingPosts ? <ActivityIndicator /> : null}
        />
      ) : (
        <FlatList
          data={polls}
          renderItem={renderPollItem}
          keyExtractor={(item) => `poll-${item.id}`}
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          decelerationRate="normal"
          nestedScrollEnabled={true}
          ListFooterComponent={loadingPolls ? <ActivityIndicator /> : null}
          extraData={userVotes}
        />
      )}
        {/* Model sends a onPress to CommentSection*/}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => {
          setModalVisible(false);
          setSelectedPost(null);

        }}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
        
          <Text style={styles.modalTitle}>Comments</Text>
          {isLoadingComments ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
          ) : ( 
            <FlatList
              data={postComments[selectedPost?.id] || []} // Comments specific to this post
              renderItem={renderCommentItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.commentList}
              ListEmptyComponent={() => <Text style={styles.noCommentsText}>No Comments Yet</Text>}
              ref={commentListRef}
            />
          )}
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            placeholderTextColor="#8E8E93"
          />
          <TouchableOpacity
            style={styles.addCommentButton}
            onPress={handleAddComment}>
            <Text style={styles.addCommentButtonText}>Add Comment</Text>
            </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pollContainer: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
},
pollTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 10,
},
pollOption: {
    backgroundColor: '#34495e',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
},
optionText: {
    color: '#ecf0f1',
    fontSize: 16,
},
voteCount: {
    color: '#bdc3c7',
    fontSize: 14,
},
  headingExplore: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 30
  },
  categoryItem: {
    flexDirection: 'row', // Align items in a row
    justifyContent: 'space-between', // Space between text and icon
    alignItems: 'center',
  },
  categoryIcon: {
    marginLeft: 10, // Space between text and icon
  },
  lottieAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Ensure the animation is above all other content
    backgroundColor: 'transparent',
  },
  postContainer: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    flexDirection: "row", // Arrange items in a row
    padding: 20,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    justifyContent: "space-between",
    alignItems: "center", // 
  
  },
  footerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  imageContainer: {
    flex: 4, // Give more space to the image section
    justifyContent: "center",
    alignItems: "flex-start",
    position: 'relative'
  },
  actionsContainer: {
    flex: 1, // Adjust space for actions
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "70%",
    borderRadius: 15,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 5,
  },
  timeStamp: {
    fontSize: 15,
    fontWeight: "300",
    color: "#333",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 15,
  },
  username: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  likeCount: {
    fontSize: 15,
    fontWeight: "300",
    color: "#333",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  voteBar: {
    flexDirection: "column", // Arrange items in a column
    justifyContent: "space-around",
    alignItems: "center",
  },
  voteButton: {
    padding: 10,
  },
  commentButton: {
    padding: 10,
    marginBottom: 10,
  },
  categoryScroll: {
    marginBottom: 10,
  },
  menuIcon: {
    marginBottom: 20,
    alignItems: 'flex-end'
  },
  theCategoryModel: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-start', // Start from the top
    paddingHorizontal: 20,
    paddingTop: 40, // Adjust top padding as needed
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'left',
    fontFamily: "San Francisco",
  },
  categoryButton: {
    marginBottom: 20, // Adjust spacing between categories
  },
  categoryButtonText: {
    fontSize: 20,
    color: 'black',
  },
 
  selectedCategoryButton: {
    backgroundColor: '#e0e0e0',
  },
  categoryButtonText: {
    color: 'black',
    fontSize: 30,
    fontFamily: "San Francisco",
  },

  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  comment: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)", // Light border to complement blur
    padding: 14,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent white
    borderRadius: 25, // Rounded corners
    color: "#333",
    fontSize: 16,
    backdropFilter: 'blur(10px)', // Apply blur to the background
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addCommentButton: {

    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  commentList: {
    flexGrow: 0,
  },
});

export default ExplorePage;