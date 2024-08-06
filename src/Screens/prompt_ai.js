import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome6 } from '@expo/vector-icons';

export default function PromptAiScreen() {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    const navigation = useNavigation();

    const generateImage = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('prompt', prompt)
            const response = await fetch('http://127.0.0.1:5000/create_image_w_prompt', {
                method: 'POST',
                body: formData,

            });
            const data = await response.json();
            console.log("Response Data:", data);
            if (response.ok) {
                setImageUrl(data.image_url);
            } else {
                Alert.alert('Error', data.error || 'Something went wrong!');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to generate image.');
          } finally {
            setLoading(false);
          }
        };
    const postImage = async () => {
        setPosting(true);
        try {
            // Generate a unique file name 
            const uniqueFileName = `generateed-imge-${Date.now()}.png`;

            const formData = new FormData();
            formData.append('newImage', {
                uri: imageUrl,
                type: 'image/png',
                name: uniqueFileName,
            });
            const response = await fetch('http://127.0.0.1:5000/posts', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json()
            if(response.ok) {
                Alert.alert('Success', 'Image posted Sucessfully!')
                navigation.navigate('Home');
            } else {
                Alert.alert('Error', data.error || 'Failed to post image!');

            }
        } catch (error) {
            Alert.alert('error', 'Failed to post image');
        } finally {
            setPosting(false);
        }

    };
    return (
    <View style={styles.container}>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Camera')}>
                <FontAwesome6 name="circle-left" size={24} color="#ffffff" />
            </TouchableOpacity>

      <Text style={styles.title}>You alone decide.</Text>
      <Text style={styles.subtitle}>
        Write whatever you want to see or experience. 
        Your adventure awaits below.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Your prompt..."
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        onChangeText={setPrompt}
        value={prompt}
      />

<TouchableOpacity style={styles.button} onPress={generateImage} disabled={loading}>
        <Text style={styles.buttonText}>Generate</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}
      {imageUrl && console.log("Image URL:", imageUrl)}
        {imageUrl && (
         <>
         <Image 
           source={{ uri: imageUrl }}
           style={styles.generateImage}
           resizeMode="contain"
         />

         <TouchableOpacity style={styles.button} onPress={postImage} disabled={posting}>
           <Text style={styles.buttonText}>Post</Text>
         </TouchableOpacity>
         {posting && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}
     </>
   )}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
},
  container: {
    flex: 1,
    backgroundColor: '#101010', // Dark background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#dddddd',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20, // Add some margin for spacing
  },
  buttonText: {
    color: '#101010',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generateImage: {
    width: '100%',
    height: 300,
    marginTop: 20,
  }
});