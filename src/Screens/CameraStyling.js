import React, {useState} from 'react';
import {View, Text, Image, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator} from 'react-native';

export default function CameraStyling({route}) {
    const {photoUri} = route.params;
    const [prompt, setPrompt] = useState('');
    const [styledImageUri, setStyledImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const api_key = process.env["API_KEY"]
    // Access your API key as an environment variable (see "Set up your API key" above)
    const genAI = new GoogleGenerativeAI(api_key);
    
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    async function applyStyle() {
        setLoading(true);
        try {
            const imagePrompt = {
                image: {
                    imageBytes: Buffer.from(fs.readFileSync(photoUri)).toString("base64"),
                },
            };
            const textPrompt = {
                text: prompt,
            };

            // const images = model.images;
            // // Replace with actual GEMINI API 
            // const promptObj = {

            //     text: prompt,
            //     image: {uri: photoUri},
            // };
            const result = await model.generateContent([imagePrompt, textPrompt])
            setStyledImageUri(result.content[1].uri); // Assuming the image is the second item
        } catch (error) {
            console.error('Error applying Gemini style: ', error);
            Alert.alert('An error occured while applying the style.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <View style={StyleSheet.container}>
            <View style={styles.imageContainer}>
            {styledImageUri ? (
                <Image source={{uri: styledImageUri}} style={styles.image} />
            ) : (
                <Image source={{uri: photoUri}} style={styles.image} />
            )}
            {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />}
</View>
            <TextInput
            style={styles.promptInput}
            placeholder="Enter prompt for Gemini"
            value={prompt}
            onChangeText={setPrompt}
            />
            <TouchableOpacity onPress={applyStyle} style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply Style</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={applyStyle} style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}


const styles = StyleSheet.create({
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