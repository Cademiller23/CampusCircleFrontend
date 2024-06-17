import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Use Camera directly
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Feather, AntDesign } from '@expo/vector-icons';
import Loading from '../Components/Loading'; // Assuming you have this component

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState('back');
  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!galleryStatus.granted) {
        Alert.alert('Sorry, we need camera roll permissions to work!');
      }
    })();
  }, []);

  if (permission === null) {
    return <Loading />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to use the camera</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.linkText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

    const takePicture = async () => {
        if(cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({quality: 0.8});
            navigation.navigate('CameraStyling', {photoUri: photo.uri});
        }
    };
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, 
            aspect: [4,3],
            quality: 1,
        });
        if(!result.canceled) {
            navigation.navigate('CameraStyling', { photoUri: result.assets[0].uri });
        }
    }
    const toggleCameraFacing = () => {
        setType(current => (current === 'back' ? 'front' :  'back'));
    }
    return(
    <View style={styles.container}>
        <CameraView
        style={styles.camera}
        type={type}
        ref={cameraRef}
        ratio={'16:9'}
      >
            <View style={styles.controls}>
                <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                <Feather name="refresh-ccw" size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
        </View>
        <View style={styles.pickImageButtonContainer}>
          <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
            <AntDesign name="picture" size={32} color="white" />
          </TouchableOpacity>
            </View>
        </CameraView>
    </View> );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'black', // Dark background for a camera-like feel
    },
    camera: {
      flex: 1,
    },
    controls: {
      position: 'absolute',
      bottom: 20,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    iconButton: {
      padding: 15,
      backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
      borderRadius: 30,
    },
    captureButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 5,
      borderColor: 'white',
      backgroundColor: 'rgba(0,0,0,0.2)', // Slightly darker capture button
    },
    pickImageButtonContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
    },
    pickImageButton: {
      padding: 15,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 30,
    },
    text: {
      color: 'white',
      fontSize: 18,
      textAlign: 'center',
    },
    linkText: {
      color: 'lightblue',
      textDecorationLine: 'underline',
    },
  });