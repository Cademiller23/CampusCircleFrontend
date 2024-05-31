import { View, Text, Image, TouchableOpacity, Pressable, TextInput, Alert, Platform, fetch, StyleSheet } from 'react-native';
import React, {useRef, useState} from 'react';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import {Feather, Octicons} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// Correct import
import {Link} from 'expo-router'
import { Loading } from './../Components/Loading';
import { CustomKeyboardView } from './../Components/CustomKeyboardView';
import LottieView from 'lottie-react-native'
export function SignUp() {
    const router = useRouter(); // Get router for navigation
    const [loading, setLoading] = useState(false); // State for loading indicator

    // Create refs for form input values
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const usernameRef = useRef(null);

    const handleRegister = async () => {
        // Check if all fields are filled
        if (!emailRef.current?.value || !passwordRef.current?.value || !usernameRef.current?.value) {
            Alert.alert('Sign Up', 'Please fill all the fields!');
            return;
        }

        setLoading(true); // Show loading indicator

        try {
            const response = await fetch('http://192.168.30.171:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailRef.current.value,
                    username: usernameRef.current.value,
                    password: passwordRef.current.value,
                }),
            });
            const data = await response.json();

            setLoading(false); // Hide loading indicator

            if (!response.ok) {
                Alert.alert('Sign Up', data.error || 'Registration Failed');
            } else {
                // Navigate to profile setup screen with user ID
                router.push({ pathname: 'profileSetup', params: { userId: data.id } }); 
            }
        } catch (error) {
            setLoading(false); // Hide loading indicator
            Alert.alert('Error', 'An error occurred during registration.');
            console.error('Registration error:', error); 
        }
    };

    return (
      
           <View style={styles.container}>  
            {/*SIgnUp Image */}
            <View style={styles.imageContainer}>
            <LottieView 
                style={{width: 200, height: 200}} 
                source={require('../../assets/university_pin.json')} 
                autoPlay 
                loop/>
                </View> 
                <View style={styles.contentContainer}>
                <Text style={styles.title}>Sign Up</Text>
                {/*inputs */}
                <View style={styles.inputContainer}>
                  <View style={styles.inputRow}>
                    <Octicons name="mail"size={hp(2.7)} color='gray' />
                    <TextInput
                    ref={emailRef}
                    style={styles.input}
                    placeholder='Email Address'
                    placeholderTextColor={'gray'}/>

                </View>
       
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
                            <TouchableOpacity onPress={handleRegister}  style={styles.signUpButton}>
                            <Text style={styles.buttonText}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                        )
                    }
                </View>
               
                {/* Sign up text*/}

                <View style={styles.signInPrompt}>
                    <Text style={styles.signInText}>Already have an account?</Text>
                    <Pressable> 
                    <Text  style={styles.signInLink}>Sign In</Text>
                    </Pressable>
                    
                </View>

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
    signUpButton: {
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
    signInPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signInText: {
        fontSize: hp(1.8),
        fontWeight: '600',
        color: '#6b7280', // Neutral-500
    },
    signInLink: {
        fontSize: hp(1.8),
        fontWeight: '600',
        color: '#6366f1', // Indigo-500
    },
});
export default SignUp;