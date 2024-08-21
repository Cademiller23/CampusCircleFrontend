import React, {useEffect, useState} from 'react';
import {View, Text, Image, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ScrollView} from 'react-native';
import {Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import { Video } from 'expo-av';
export default function CameraStyling({route, navigation}) {
  
    const {photoUri, isVideo} = route.params;
    const [prompt, setPrompt] = useState('');
    const [styledImageUri, setStyledImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCategoryPress = (category) => {
      setSelectedCategory(category);
    }
   
    useEffect(() => {
      if(styledImageUri) {
        forceUpdate();
      }
      }, [styledImageUri]);
  
    async function applyStyle() {
      if (isVideo) {
        Alert.alert('Cannot apply style to video', 'You cannot apply styles to a video.');
        return;
      }
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: photoUri,
          type: 'image/png',
          name: 'image.png',

        });
        formData.append('prompt', prompt);
        formData.append('content_type', 'image/png');
        formData.append('content_url', photoUri);

        const response = await fetch('http://127.0.0.1:5000/manipulate_image', {
          method: 'POST',
          body: formData,
      });
      const data = await response.json();
      console.log(data)
      if(response.ok) {
        setStyledImageUri(data.manipulate_image_url);
        setPrompt('');
      } else {
        console.error('Error from API:', data.error || 'Unknown error');
        Alert.alert('API Error', 'Could not manipulate the image');
      }
      } catch (error) {
      console.error('Network error:', error);
      Alert.alert("Network Error", "could not connect to the API");

      } finally {
      setLoading(false);
    }
    }
    async function handleCreateImage() {
      const imageUri = styledImageUri || photoUri;
      const formData = new FormData();

      formData.append('newImage', {
          uri: imageUri,
          type: isVideo ? 'video/mp4' : 'image/png',
          name: isVideo ? 'newVideo.mp4' : 'newImage.png',
      });
      console.log(imageUri)
        // Add the content type and URL if they are available
  if (styledImageUri) {
    formData.append('content_type', 'image/png');
    formData.append('content_url', imageUri);
    }
    if(selectedCategory) {
      formData.append('category', selectedCategory);
    }
   
      try {
          const response = await fetch(`http://127.0.0.1:5000/posts`, {
              method: 'POST',
              body: formData,
             
          
          });
          console.log("Response from server:", response);
          if(!response.ok) {
              const errorText = await response.text(); // Get the error text from the response
              throw new Error(`Image Update Failed (${response.status})`);

          }
          const data = await response.json(); // Get response data
          
          Alert.alert('Sucess', 'Image Updated Successfully!', [
              {
                  text: 'OK',
              },
          ]);
          navigation.navigate('Main', {
            screen: 'Home',
            params: {userId: data}
          })
      } catch (error) {
          console.error(error);
          Alert.alert('Error', 'An error occured while updating the profile.');
      }
      
  };
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
            {isVideo ? (
           <Video
           source={{ uri: photoUri }}
           style={styles.image}
           useNativeControls
           resizeMode="contain"
       />
            ) : styledImageUri ? (
                <Image source={{uri: styledImageUri, cache: 'reload'}} style={styles.image} />
            ) : (
              <View style={styles.ImageContainer}>
                <Image source={{uri: photoUri}} style={styles.image} />
                </View>
            )}
            {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />}
</View>
{!isVideo && (
    <View style={styles.applyButtonContainer}>
            <TextInput
            style={styles.promptInput}
            placeholder="Write a prompt to generate a new Image!"
            value={prompt}
            onChangeText={setPrompt}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            multiline
            />
           
        <TouchableOpacity onPress={applyStyle} style={styles.applyButton}>
          <Ionicons name="brush" size={12} color="white" />
        </TouchableOpacity>
       
      </View>
      )}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {['So Frat', 'Laughs', 'Education', 'Football', 'Dining Hall Fails', 'Need Adivce', 'Trojan Talk'].map(category => (
                  <TouchableOpacity
                  key={category}
                  onPress={() => handleCategoryPress(category)}
                  style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
                  >
                    <Text style={styles.categoryButtonText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Submit Button */}
            <TouchableOpacity onPress={handleCreateImage} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
  categoryScroll: {
    marginBottom: 20,
    padding: 50,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  selectedCategoryButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
  },
  categoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  ImageContainer: {
    width: 350,
    height: 350,
    margin: 12,
    borderRadius: 20,
    padding: 20,
    shadowColor: 'black', // Color of the shadow
    shadowOffset: { width: 0, height: 2 }, // Shadow offset (horizontal, vertical)
    shadowOpacity: 0.3, // Shadow opacity (0-1)
    shadowRadius: 3, // Shadow blur radius
    overflow: 'hidden', // To clip the image to the rounded corners
  },
    container: {
      flex: 1,
      backgroundColor: '#101010', // Dark background
      justifyContent: 'center',
      
    },
    imageContainer: {
      width: '100%',
      aspectRatio: 1, 
      borderRadius: 10,
      overflow: 'hidden', // Clip the image to the rounded corners
      marginBottom: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    loadingIndicator: {
      position: 'absolute',
    },
    promptInput: {
    width: '100%',
    height: 100,
    backgroundColor: '#333', // Dark gray background
    borderRadius: 12,
    padding: 15,
    color: 'white',
    fontSize: 16,
    marginBottom: 15,
    textAlignVertical: 'top',
    
    },
    applyButtonContainer: {
      borderColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 5,
      width: '100%',
      alignItems: 'flex-end', // Align to the right
      marginBottom: 15,
    },
    applyButton: {
      position: 'absolute', // Position the button absolutely
      right: 15, // Position it on the right inside the TextInput
      top: 55, // Adjust top position to align with TextInput
      backgroundColor: '#007AFF',
      padding: 10,
      borderRadius: 20,
    },
  
    submitButton: {
      backgroundColor: '#1C1C1E', 
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',

      padding: 30
    },
    submitButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
  });