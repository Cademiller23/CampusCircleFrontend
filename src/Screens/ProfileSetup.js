import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Alert, StyleSheet, ImageBackground, useWindowDimensions} from 'react-native';
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons';

import { useNavigation, StackActions } from '@react-navigation/native';

export function ProfileSetup({ route }) {
    const {width, height} = useWindowDimensions();
    const userId  = route?.params?.userId;
    const [profileImage, setProfileImage ] = useState(null);
    const navigation = useNavigation();
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1,1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleProfileSubmit = async () => {
        const formData = new FormData();
        formData.append('profileImage', {
            uri: profileImage,
            type: 'image/jpeg',
            name: 'profileImage.jpg',
        });
     
        try {
            const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
                method: 'PATCH',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            
            });

            if(!response.ok) {
                throw new Error('Profile Update Failed')
            }
            const data = await response.json(); // Get response data
            
            Alert.alert('Sucess', 'Profile Updated Successfully!', [
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
        <View style={[styles.container, {width, height, backgroundColor: '#e2e8f0' }]}>
            <ImageBackground source={{uri:profileImage}} 
            style={styles.backgroundImage}
            imageStyle={{opacity: 0.4}}
            blueRadius={10}>
                <Text style={styles.title}>Profile Image</Text>
                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                    {profileImage ? (
                        <Image
                        source={{uri: profileImage}} 
                        style={styles.image}
                        contentFit="cover"/>
                    ) : (     
                        <View style={styles.placeholderContainer}>
                        <AntDesign name="pluscircleo" size={80} color="white" />
                    </View>
                    )}

             
                </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleProfileSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
             </TouchableOpacity>  
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
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 20,
      color: 'black',
      textShadowColor: '#6366f1', // Add a subtle drop shadow
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
    },
    imageContainer: {
      width: 300,
      height: 300,
      borderRadius: 150, // Make it a perfect circle
      overflow: 'hidden', // Clip the image to the circle
      borderWidth: 4,
      borderColor: 'white',
      marginBottom: 30,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cbd5e1', // Neutral-500 for placeholder
        borderRadius: 150, // Keep the circular shape
    },
    image: {
      flex: 1,
      width: '100%',
    },
    submitButton: {
        backgroundColor: '#6366f1', //Indigo
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        marginTop: 20, // Add margin to separate from image
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  export default ProfileSetup;