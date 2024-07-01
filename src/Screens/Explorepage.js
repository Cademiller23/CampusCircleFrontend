import React, { useState, useRef, useEffect } from "react";
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
  Alert, Image
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal"; // Use react-native-modal for additional features

import { Video } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import Loading from "../Components/Loading";



const ExplorePage = () => {
  const [data, setData] = useState(null);
  const [votes, setVotes] = useState({});
  const [posts, setPosts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [loading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [postComments, setPostComments] = useState({}); // Comments for each post
  const [isLoadingComments, setIsLoadingComments] = useState(false);


  const commentListRef = useRef(null);
 
 useFocusEffect(
  React.useCallback(() => {
    fetchPosts(); // Fetch posts again whe the screen gets focus
  }, [selectedCategoryFilter, currentPage]) // Fetch also when filter changes

 );
 
 const fetchPosts = async () => {
  try {
    setIsLoading(true); // Show Loading Indicator
    const categoryQuery = selectedCategoryFilter === "all" ? "" : selectedCategoryFilter;
    const response = await fetch(`http://127.0.0.1:5000/explore_posts?page=${currentPage}&per_page=10&category=${categoryQuery}`);
    

    if(response.ok) {
      const data = await response.json();
      
      // Ensure posts from the same user are not shown sequentially
      const shuffledPosts = shuffleArray(data.posts); // Shuffle posts

      setPosts(currentPage === 1 ? shuffledPosts : [...posts, ...shuffledPosts]);
      setHasNextPage(data.has_next);

    } else {
      throw new Error('No Posts error fetching posts');
    }
  } catch (error) {
    Alert.alert('Error', 'An error occured while fetching posts.')
    console.error(error);

  } finally {
    setIsLoading(false);
  }
 }
 // Fisher-Yates Shuffle (to randomize posts)
 const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
 };
  const processTime = (timeStamp) => {
    if (timeStamp >= 60) {
      if (timeStamp / 60 === 1) {
        return "1 hour ago";
      } else {
        return timeStamp / 60 + " hours ago";
      }
    } else {
      if (timeStamp === 1) {
        return "1 minute ago";
      } else {
        return timeStamp + " minutes ago";
      }
    }
  };

  const handleVote = (id, type) => {
    setVotes((prevVotes) => {
      const currentVote = prevVotes[id];
      const newVotes = {
        ...prevVotes,
        [id]: currentVote === type ? null : type,
      };

      setData((prevData) => {
        return prevData.map((post) => {
          if (post.id === id) {
            let likeCount = post.likeCount;
            if (type === "upvote") {
              if (currentVote === "downvote") {
                likeCount = likeCount + 2;
              } else if (currentVote === "upvote") {
                likeCount = likeCount - 1;
              } else {
                likeCount = likeCount + 1;
              }
            } else if (type === "downvote") {
              if (currentVote === "downvote") {
                likeCount = likeCount + 1;
              } else if (currentVote === "upvote") {
                likeCount = likeCount - 2;
              } else {
                likeCount = likeCount - 1;
              }
            }
            return { ...post, likeCount };
          }
          return post;
        });
      });

      return newVotes;
    });
  };
  const fetchCommentsForPost = async (postId) => {
    console.log(postId);
    try {
      const response = await fetch(`http://127.0.0.1:5000/newComments/${postId}`);
      
      if(response.ok) {
        const data = await response.json();
        console.log(data);
        setPostComments(prev => ({ ...prev, [postId]: data })); 
        
      } else if (response.status === 404) {
        // Handle the "No Comments Yet" case
        setPostComments(prev => ({ ...prev, [postId]: [] }));  // Set an empty array
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch comments'); // Throw with the backend's error message
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occured while fetching comments.')

    }
  };
  useEffect(() => {
    if(selectedPost) {
      setModalVisible(true);
    } else {
      setModalVisible(false);
    }
  }, [selectedPost]);
  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setIsLoadingComments(true);
    fetchCommentsForPost(post.id)
    .finally(() => setIsLoadingComments(false));
  };
  const handleAddComment = async () => {
    if (newComment.trim() === "") return; //  To not submit empty comments
    try {
      setIsLoadingComments(true)
      const response = await fetch('http://127.0.0.1:5000/create_comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
        body: JSON.stringify({
          post_id: selectedPost.id,
          text: newComment,
        }),
      });
      if (response.ok) {
        const newCommentData = await response.json();
        setPostComments(prev => ({
          ...prev,
          [selectedPost.id]: [...(prev[selectedPost.id] || []), newCommentData], // Add new comment
        }));
        setNewComment("");
        fetchCommentsForPost(selectedPost.id);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to add comment');
      
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while adding the comment.');
    }
  };
 
  const handleSave = async (post) => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) {
      // Handle the case where the user is not logged in (e.g., show a login screen)
      return Alert.alert('Error', 'You must be logged in to save a post.');
    }
    try {
      const response = await fetch(`http://127.0.0.1:5000/save_post/${post.id}`, {
        method: 'POST',
        headers: {
          'content_type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });
      if(response.ok) {
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


  const renderItem = ({ item }) => {
    const voteStatus = votes[item.id];
    const base64Image = `data:${item.content_type};base64,${item.content_url}`
    const username = item.username || "Unknown User"; 
    return (
      
      <View style={styles.postContainer}>
        <TouchableOpacity
        style={styles.commentButton}
        onPress={() => handleSave(item)}>
          <Entypo name="bookmark" size={24} color="black" />
        </TouchableOpacity>
         <TouchableOpacity
            style={styles.commentButton}
            onPress={() => handleOpenComments(item)}
          >
            <Icon name="comment" size={24} color="#666" />
          </TouchableOpacity>
        <Image
          source={{ uri: base64Image }}
          style={styles.video}
          resizeMode="cover"
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.username}>@{username}</Text>
        
        <Text style={styles.timeStamp}>{processTime(item.timestamp)}</Text>
        <View style={styles.voteBar}>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleVote(item.id, "upvote")}
          >
            {/* On Press go to function */}
            <Icon
              name="arrow-up"
              size={24}
              color={voteStatus === "upvote" ? "#000" : "#666"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.voteButton}
            onPress={() => handleVote(item.id, "downvote")}
          >
            <Icon
              name="arrow-down"
              size={24}
              color={voteStatus === "downvote" ? "#000" : "#666"}
            />
          </TouchableOpacity>
          <Text style={styles.likeCount}>{item.likeCount} </Text>
         
        </View>
      </View>
    );
  };
  const handleCategoryFilterPress = (category) => {
    setSelectedCategoryFilter(category);
  };
  const handleLoadMore = () => {
    if(hasNextPage) {
      setCurrentPage(currentPage + 1);
      fetchPosts();
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Category Filter Buttons - Same as in CameraStyling */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {['frat', 'laughs', 'education', 'all'].map(category => (
          <TouchableOpacity
          key={category}
          onPress={() => handleCategoryFilterPress(category)}
          style={[styles.categoryButton, selectedCategoryFilter === category && styles.selectedCategoryButton]}
        >
          <Text style={styles.categoryButtonText}>{category}</Text>
        </TouchableOpacity>
          ))}
      </ScrollView>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
      />
        {/* Model sends a onPress to CommentSection*/}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => {
          setModalVisible(false);
          setSelectedPost(null);
          setPostComments({});
        }}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Comments</Text>
          {isLoadingComments ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
          ) : postComments[selectedPost?.id] && postComments[selectedPost?.id].length > 0 ? (
            <FlatList
              ref={commentListRef}
              data={postComments[selectedPost?.id] || []} // Comments specific to this post
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentText}>{item.text}</Text>
                  <Text style={styles.commentUsername}>@{item.username}</Text>
                </View>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.commentList}
              ListEmptyComponent={() => <Text style={styles.noPostsText}>No Comments Yet</Text>}
            />
          ) : (
            <Text>NO Comments YET</Text>
          )}
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
          />
          <Button
            color="black"
            title="Add Comment"
            onPress={handleAddComment}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryScroll: {
    marginBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postContainer: {
    height: Dimensions.get("window").height,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderTopWidth: 1,
    padding: 20,
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
    position: "absolute",
    top: 80,
    left: 20,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  timeStamp: {
    fontSize: 15,
    fontWeight: "300",
    color: "#333",
    position: "absolute",
    top: 80,
    right: 20,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  username: {
    fontSize: 15,
    paddingBottom: 15,
    fontWeight: "300",
    color: "#333",
    position: "absolute",
    top: 60,
    left: 22,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  likeCount: {
    fontSize: 15,
    fontWeight: "300",
    color: "#333",
    padding: 15,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  voteBar: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  voteButton: {
    padding: 10,
  },
  commentButton: {
    padding: 10,
    marginLeft: "auto",
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
    borderColor: "#d3d3d3",
    padding: 10,
    marginBottom: 10,
  },
  commentList: {
    flexGrow: 0,
  },
});

export default ExplorePage;