import { View, Text, Image, TouchableOpacity, Pressable, TextInput, Alert, Platform, StyleSheet } from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import {Feather, Octicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Correct import
import {Link} from 'expo-router'
import { Loading } from './../Components/Loading';
import { CustomKeyboardView } from './../Components/CustomKeyboardView';
import LottieView from 'lottie-react-native'
export function SignUp() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false); // State for loading indicator
    
    // Create refs for form input values
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleRegister = async () => {
        // Check if all fields are filled
        if (!email || !password || !username) {
            Alert.alert('Sign Up', 'Please fill all the fields!');
            return;
        }

        setLoading(true); // Show loading indicator

        try {
            const response = await fetch('http://127.0.0.1:5000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    username: username,
                    password: password,
                }),
            });
            const data = await response.json();
            setLoading(false); // Hide loading indicator

            if (!response.ok) {
                Alert.alert('Sign Up', data.error || 'Registration Failed');
            } else {
                // Navigate to profile setup screen with user ID
                await AsyncStorage.setItem('registered', 'true');
                navigation.navigate('ProfileSetup', { userId: data.id }); // Use navigation.navigate
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
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    placeholder='Email Address'
                    placeholderTextColor={'gray'}/>

                </View>
       
                <View style={styles.inputRow}>
                    <Octicons name="lock"size={hp(2.7)} color='gray' />
                    <TextInput
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    placeholder='Password'
                    secureTextEntry
                    placeholderTextColor={'gray'}/>

                </View>

                <View style={styles.inputRow}>
                    <Feather name="user"size={hp(2.7)} color='gray' />
                    <TextInput
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    placeholder='Username'
                    placeholderTextColor={'gray'}/>

                </View>
                <View> 
                    {
                        // loading? (
                        //     <View style={styles.loadingContainer}>
                        //    <Loading size={hp(6.5)} />
                        //         </View>
                        // ): (
                            <TouchableOpacity onPress={handleRegister}  style={styles.signUpButton}>
                            <Text style={styles.buttonText}>
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                        // )
                    }
                </View>
               
                {/* Sign up text*/}

                <View style={styles.signInPrompt}>
                    <Text style={styles.signInText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}> 
                    <Text  style={styles.signInLink}>Sign In</Text>
                    </TouchableOpacity>
                    
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