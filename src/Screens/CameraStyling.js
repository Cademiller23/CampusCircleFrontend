import React, {useState} from 'react';
import {View, Text, Image, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ScrollView} from 'react-native';
import { genAI } from '../geminiUse';
import { Buffer } from 'buffer';
export default function CameraStyling({route, navigation}) {
  
    const {photoUri} = route.params;
    const [prompt, setPrompt] = useState('');
    const [styledImageUri, setStyledImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCategoryPress = (category) => {
      setSelectedCategory(category);
    }
    async function fileToGenerativePart(file) {
      const base64EncodedDataPromise = new Promise()
    }
    async function applynewStyle() {
      const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'});
      const text = `Generate an image that looks like this but in the style of ${prompt}`;

    
      const image = {
        inlineData: {
          data: base64EncodedImage,
          mimeType: "image/jpeg"
        },
      };
      const result = await model.generateContent([text, image]);
      console.log(result.response.text());
    }
    async function applyStyle() {
        setLoading(true);
        try {
          
          const apiKey = process.env.API_KEY;
          console.log(apiKey)
          const text = `Generate an image that looks like this but in the style of ${prompt}`;
          const apiUrl = `https://generativeai.googleapis.com/v1beta2/models/test-bison@001:generateImage?key=${apiKey}`;
          const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',

              },
              body: JSON.stringify({
                prompt: {
                  text: text,
                }
              }),
            });
            const data = await response.json();
            console.log("DATA", data)
            if (response.ok && data.candidates && data.candidates.length > 0) {
                setStyledImageUri(data.candidates[0].uri);
              } else {
                console.error('Error from Gemini:', data.error || 'No image candidates returned');
                Alert.alert('API Error', 'Could not generate styled image');
              }
        } catch (error) {
            console.error('Network error:', error);
            Alert.alert('Network Error', 'Could not connect to the API');
        } finally {
            setLoading(false);
        }
    };
    async function handleCreateImage() {
      const imageUri = photoUri;
      const formData = new FormData();

      formData.append('newImage', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'newImage.jpg',
      });
      console.log(imageUri)
        // Add the content type and URL if they are available
  if (styledImageUri) {
    formData.append('content_type', 'image/jpeg');
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
        <View style={StyleSheet.container}>
            <View style={styles.imageContainer}>
            {styledImageUri ? (
                <Image source={{uri: styledImageUri}} style={styles.image} />
            ) : (
              <View style={styles.ImageContainer}>
                <Image source={{uri: photoUri}} style={styles.image} />
                </View>
            )}
            {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />}
</View>
            <TextInput
            style={styles.promptInput}
            placeholder="Enter prompt for Gemini"
            value={prompt}
            onChangeText={setPrompt}
            />
            <TouchableOpacity onPress={applynewStyle} style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply Style</Text>
            </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {['frat', 'laughs', 'education'].map(category => (
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
            <TouchableOpacity onPress={handleCreateImage} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
  categoryScroll: {
    marginBottom: 10,
    padding: 10,
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
  ImageContainer: {
    width: 350,
    height: 350,
    margin: 12,
    borderRadius: 20,
    padding: 20,
    // Add Drop Shadow
    shadowColor: 'black', // Color of the shadow
    shadowOffset: { width: 0, height: 2 }, // Shadow offset (horizontal, vertical)
    shadowOpacity: 0.3, // Shadow opacity (0-1)
    shadowRadius: 3, // Shadow blur radius
  },
    container: {
      flex: 1,
      backgroundColor: '#121212', // Dark background
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
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
      backgroundColor: '#222',
      borderRadius: 8,
      padding: 10,
      color: 'white',
      marginBottom: 15,
    },
    applyButton: {
      backgroundColor: '#007AFF', // Blue button
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    applyButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });