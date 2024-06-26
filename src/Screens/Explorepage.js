import React, { useState, useRef } from "react";
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
  Alert, Image
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal"; // Use react-native-modal for additional features

import { Video } from "expo-av";
import { useFocusEffect } from "@react-navigation/native";
import Loading from "../Components/Loading";

const initialData = [
  {
    id: "1",
    title: "Lebron and Curry",
    timestamp: 300,
    username: "lebrongoat",
    videoUri: "https://www.w3schools.com/html/movie.mp4",
    thumbnail:
      "https://cdn.vox-cdn.com/thumbor/RgKKALcRqv7p-AJTd3O-bJTBLr4=/0x30:4014x2706/1200x800/filters:focal(0x30:4014x2706)/cdn.vox-cdn.com/uploads/chorus_image/image/49894465/usa-today-9339378.0.jpg",
    likeCount: 110,
    comments: ["fraud", "not the goat", "L"],
  },
  {
    id: "2",
    title: "Jayson Tatum Dunking",
    timestamp: 15,
    username: "tatumgoat",
    videoUri: "https://www.w3schools.com/html/movie.mp4",
    thumbnail:
      "https://assets.apnews.com/0b/92/8816a2bc817bba08164ebe9444ab/e8853552f3e0418ca5f0938ea63b43e7",
    likeCount: 110,
    comments: ["goat", "so sexy", "banner #18"],
  },
  // Add more posts as needed
];

const ExplorePage = () => {
  const [data, setData] = useState(initialData);
  const [votes, setVotes] = useState({});
  const [posts, setPosts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [loading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);


  const commentListRef = useRef(null);
  /*
    const [comments, setComments] = useState([]);
    function CommentSection(post_id) {
        const response = await fetch('http://-----:5000/comments/${post_id}')
        const data = response.json();
    

    }
    function upVotePost(post_id) {
        
    }

  */
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

  const handleOpenComments = (post) => {
    setSelectedPost(post);
    setModalVisible(true);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setData((prevData) => {
        const newData = prevData.map((post) => {
          if (post.id === selectedPost.id) {
            const updatedPost = {
              ...post,
              comments: [...post.comments, newComment],
            };
            setSelectedPost(updatedPost);
            return updatedPost;
          }
          return post;
        });
        return newData;
      });

      setNewComment("");

      // Scroll to the end of the FlatList
      setTimeout(() => {
        if (commentListRef.current) {
          commentListRef.current.scrollToEnd({ animated: true });
        }
      }, 100); // delay to ensure state update is complete
    }
  };

  const renderItem = ({ item }) => {
    const voteStatus = votes[item.id];
    const base64Image = `data:${item.content_type};base64,${item.content_url}`
    return (
      <View style={styles.postContainer}>
        <Image
          source={{ uri: base64Image }}
          style={styles.video}
          resizeMode="cover"
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.username}>@{item.username}</Text>
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
          <TouchableOpacity
            style={styles.commentButton}
            onPress={() => handleOpenComments(item)}
          >
            <Icon name="comment" size={24} color="#666" />
          </TouchableOpacity>
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
        onBackdropPress={() => setModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Comments</Text>
          <FlatList
            ref={commentListRef}
            data={selectedPost?.comments || []}
            renderItem={({ item }) => (
              <Text style={styles.comment}>{item}</Text>
            )}
            keyExtractor={(item, index) => index.toString()}
            style={styles.commentList}
          />
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
    fontWeight: "300",
    color: "#333",
    position: "absolute",
    top: 102,
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