import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ImageBackground, useWindowDimensions, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';

export function ProfileSetup({ route }) {
    const { width, height } = useWindowDimensions();
    const userId = route?.params?.userId;
    const [profileImage, setProfileImage] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const navigation = useNavigation();

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const generateImage = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('prompt', prompt);
            const response = await fetch('http://127.0.0.1:5000/create_image_w_prompt', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                setProfileImage(data.image_url);
            } else {
                Alert.alert('Error', data.error || 'Something went wrong!');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to generate image.');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async () => {
        if (!profileImage) {
            Alert.alert('Error', 'Please select a profile image.');
            return;
        }
        setPosting(true);


           // Determine the image type dynamically based on the file extension
        const imageExtension = profileImage.split('.').pop();
        const imageType = `image/${imageExtension}`;

        const formData = new FormData();
            formData.append('profileImage', {
            uri: profileImage,
            type: imageType,
            name: `profileImage.${imageExtension}`,
        });
       

        try {
            const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (!response.ok) {
                throw new Error('Profile Update Failed');
            }
            Alert.alert('Success', 'Profile Updated Successfully!', [
                {
                    text: 'OK',
                },
            ]);
            navigation.navigate('Main', {
                screen: 'Home',
                params: { userId },
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while updating the profile.');
        } finally {
            setPosting(false);
        }
    };

    return (
        <View style={[styles.container, { width, height, backgroundColor: '#e2e8f0' }]}>
            <ImageBackground source={{ uri: profileImage }} 
                style={styles.backgroundImage}
                imageStyle={{ opacity: 0.4 }}
                blueRadius={10}>
                <Text style={styles.title}>Profile Photo</Text>

                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={styles.image}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={styles.placeholderContainer}>
                            <AntDesign name="pluscircleo" size={80} color="white" />
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.promptLabel}>Or</Text>
                <Text style={styles.promptLabel}>Generate Prompt for Image</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your prompt..."
                    placeholderTextColor="#010101"
                    onChangeText={setPrompt}
                    value={prompt}
                />
                <TouchableOpacity style={styles.button} onPress={generateImage} disabled={loading}>
                    <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
                {loading && <ActivityIndicator size="large" color="#010101" style={{ marginTop: 20 }} />}

                {profileImage && (
                    <TouchableOpacity style={styles.submitButton} onPress={handleProfileSubmit} disabled={posting}>
                        <Text style={styles.buttonText}>Post your Profile Photo</Text>
                    </TouchableOpacity>
                )}
                {posting && <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />}
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
        textShadowColor: '#010101',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    imageContainer: {
        width: 300,
        height: 300,
        borderRadius: 150,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#000000',
        marginBottom: 30,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cbd5e1',
        borderRadius: 150,
    },
    image: {
        flex: 1,
        width: '100%',
    },
    promptLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        width: '80%',
        padding: 15,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#010101',
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#010101', //Indigo
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 20, // Add margin to separate from image
    },
    button: {
        backgroundColor: '#010101',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  export default ProfileSetup;