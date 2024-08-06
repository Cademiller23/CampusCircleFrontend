import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Feather, AntDesign, MaterialIcons, Ionicons, FontAwesome, Fontisto } from '@expo/vector-icons';
import Loading from '../Components/Loading';
import { BlurView } from 'expo-blur';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [type, setType] = useState('back');
  const [flashMode, setFlashMode] = useState('off');
  const [isRecording, setIsRecording] = useState(false);
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
  
  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync();
        navigation.navigate('CameraStyling', { photoUri: video.uri, isVideo: true });
      } catch (error) {
        console.error(error);
      } finally {
        setIsRecording(false);
      }
    }
  };
  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      navigation.navigate('CameraStyling', { photoUri: photo.uri });
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      navigation.navigate('CameraStyling', { photoUri: result.assets[0].uri, isVideo: result.assets[0].type === 'video' });
    }
  };

  const toggleCameraFacing = () => {
    setType((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlashMode((current) =>
      current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off'
    );
  };

  return (
    <View style={styles.container}>

      <CameraView
        style={styles.camera}
        type={type}
        flashMode={flashMode}
        ref={cameraRef}
        ratio={'16:9'}
      >
        <View style={styles.controls}>
          <TouchableOpacity style={[styles.captureButton, isRecording && styles.recordingButton]}
           onPress={takePicture} onPressIn={startRecording} onPressOut={stopRecording} />
        </View>

        <View style={styles.topNavContainer}>
          <BlurView intensity={50} tint="dark" style={styles.blurView}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Home')}>
              <Ionicons name="home-outline" size={24} color="white" />
            </TouchableOpacity>
          </BlurView>
          <BlurView intensity={50} tint="dark" style={styles.blurView}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Explore')}>
              <Feather name="compass" size={24} color="white" />
            </TouchableOpacity>
          </BlurView>
        </View>
        <View style={{top: 320}}>
        <Text style={{fontSize: 14, color: 'white', fontFamily: 'san fransisco'}}>Generate Image</Text>
        <Fontisto name="angle-dobule-down" size={14} color="white" style={{top: 16, left: 50}}/>
        </View>
       <View style={styles.pickImageButtonContainer}>
          <BlurView intensity={50} tint="dark" style={styles.blurView}>
         
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('prompt_ai')}>
              <FontAwesome
                name="paint-brush"
                size={32}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
              <MaterialIcons
                name={flashMode === 'off' ? 'flash-off' : flashMode === 'on' ? 'flash-on' : 'flash-auto'}
                size={32}
                color="white"
              />
            </TouchableOpacity>
          </BlurView>
          <BlurView intensity={50} tint="dark" style={styles.blurView}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
              <Feather name="refresh-ccw" size={32} color="white" />
            </TouchableOpacity>
          </BlurView>
          <BlurView intensity={50} tint="dark" style={styles.blurView}>
            <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
              <AntDesign name="picture" size={32} color="white" />
            </TouchableOpacity>
          </BlurView>
        </View>
      
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  promptButton: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
    alignItems: 'center',
  },
  promptText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '300',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue' : 'Roboto',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 22,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
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
  recordingButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    backgroundColor: 'red',
  },
  topNavContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 15,
    borderRadius: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  pickImageButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  pickImageButton: {
    padding: 15,
    borderRadius: 30,
  },
  blurView: {
    borderRadius: 30,
    overflow: 'hidden',
    padding: 5,
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