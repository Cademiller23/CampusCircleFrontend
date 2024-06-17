import { View, Text, Image, TouchableOpacity, Pressable, TextInput, Alert, Platform, fetch, StyleSheet } from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import {Feather, Octicons} from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Loading } from './../Components/Loading';
import { CustomKeyboardView } from './../Components/CustomKeyboardView';
import LottieView from 'lottie-react-native'
export function SignIn() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false); // State for loading indicator
    const route = useRoute();
    // Create refs for form input values
    const passwordRef = useRef(null);
    const usernameRef = useRef(null);
    useEffect(() => {
        // Check if the user is already signed in
        if (route.params?.signedIn) {
            navigation.navigate('Home');
        }
    }, [route.params]); 
    const handleSignIn = async () => {
        // Check if all fields are filled
        if (!passwordRef.current?.value || !usernameRef.current?.value) {
            Alert.alert('Sign Up', 'Please fill all the fields!');
            return;
        }

        setLoading(true); // Show loading indicator

        try {
            const response = await fetch('http://192.168.30.171:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: usernameRef.current.value,
                    password: passwordRef.current.value,
                }),
            });
            const data = await response.json();

            setLoading(false); // Hide loading indicator

            if (!response.ok) {
                Alert.alert('Sign In', data.error || 'Login Failed');
            } else {
                await AsyncStorage.setItem('userData', JSON.stringify(data)); // Store userData
                navigation.navigate('Home'); // Navigate to Home after successful login 
                console.log("Sign In Successful", data)
            }
        } catch (error) {
            setLoading(false); // Hide loading indicator
            Alert.alert('Error', 'An error occurred during Login.');
            console.error('Login error:', error); 
        }
    };

    return (
      
           <View style={styles.container}>  
            {/*SIgnUp Image */}
            <View style={styles.imageContainer}>
            <LottieView 
                style={{width: 200, height: 200}} 
                source={require('../../assets/Location_Pin.json')} 
                autoPlay 
                loop/>
                </View> 
                <View style={styles.contentContainer}>
                <Text style={styles.title}>Sign In</Text>
                {/*inputs */}
       
                <View style={styles.inputRow}>
                    <Octicons name="lock"size={hp(2.7)} color='gray' />
                    <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder='Password'
                    secureTextEntry
                    placeholderTextColor={'gray'}/>

                </View>

                <View style={styles.inputRow}>
                    <Feather name="user"size={hp(2.7)} color='gray' />
                    <TextInput
                    ref={usernameRef}
                    style={styles.input}
                    placeholder='Username'
                    placeholderTextColor={'gray'}/>

                </View>
                <View> 
                    {
                        loading? (
                            <View style={styles.loadingContainer}>
                           <Loading size={hp(6.5)} />
                                </View>
                        ): (
                            <TouchableOpacity onPress={handleSignIn}  style={styles.signInButton}>
                            <Text style={styles.buttonText}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                        )
                    }
                </View>
               
                {/* Sign up text*/}

                <View style={styles.signUpPrompt}>
                    <Text style={styles.signUpText}>Don't have an account?</Text>
                    <Pressable onPress={() => navigation.navigate('SignUp')}> 
                    <Text  style={styles.signUpLink}>Sign Up</Text>
                    </Pressable>
                    
                </View>

                </View>
               </View>
           
      
    )
    }
// Stying components

// Stylesheet for styling components
const styles = StyleSheet.create({
    // Styles for the main container
    container: {
        paddingTop: hp(7), 
        paddingHorizontal: wp(5), 
        flex: 1,
        gap: 12,
    },
    // Styles for the image container
    imageContainer: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center', 
    },
    // Styles for the content container
    contentContainer: {
        flex: 3,
        gap: 10,
    },
    // Styles for the title text
    title: {
        fontSize: hp(4), 
        fontWeight: 'bold', 
        letterSpacing: 1.5, // Add letter spacing
        textAlign: 'center', 
        color: '#333', // Dark gray color
    },
    // Styles for the container holding the input fields
    inputContainer: {
        gap: 4,
    },
    // Styles for each input row
    inputRow: {
        height: hp(7), 
        flexDirection: 'row', 
        gap: 4, 
        paddingHorizontal: 16,
        backgroundColor: '#f0f0f0', // Light gray background
        alignItems: 'center', 
        borderRadius: 30, // Rounded corners
    },
    // Styles for the input fields themselves
    input: {
        fontSize: hp(2), 
        fontWeight: '600', 
        color: '#333',
        flex: 1, 
    },    // Loading Container (when loading is true)
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },

    // Sign Up Button
    signInButton: {
        height: hp(6.5),
        backgroundColor: '#6366f1', // Indigo-500
        borderRadius: 20, // Slightly rounded corners
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Button Text
    buttonText: {
        fontSize: hp(2.7),
        color: 'white',
        fontWeight: 'bold',
        letterSpacing: 1.2, // Slightly wider letter spacing
    },

    // Sign In Prompt
    signUpPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signUpText: {
        fontSize: hp(1.8),
        fontWeight: '600',
        color: '#6b7280', // Neutral-500
    },
    signUpLink: {
        fontSize: hp(1.8),
        fontWeight: '600',
        color: '#6366f1', // Indigo-500
    },
});
export default SignIn;