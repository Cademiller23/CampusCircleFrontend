// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { View, Text, Image, TouchableOpacity, Pressable, TextInput, Alert, StyleSheet } from 'react-native';
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
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    // Google AUTH
    // GoogleSignin.configure({
    //     webClientId: '811286224163-blndpamlqm7dfmdre0q4t512pefpb1vu.apps.googleusercontent.com', // Replace with your actual client ID
    //     offlineAccess: true, // Enables offline access, useful for server-side integration
    //     iosClientId: '811286224163-blndpamlqm7dfmdre0q4t512pefpb1vu.apps.googleusercontent.com'
        
    //   });
    //   const handleGoogleSignIn = async () => {
    //     try {
    //         await GoogleSignin.hasPlayServices();
    //         const userInfo = await GoogleSignin.signIn();

    //         // Send ID token to your backend
    //         const response = await fetch('http://127.0.0.1:5000/auth/callback', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ idToken: userInfo.idToken }),
    //         });

    //         const data = await response.json();

    //         if (response.ok) {
    //             await AsyncStorage.setItem('userData', JSON.stringify(data));
    //             navigation.navigate('Home');
    //         } else {
    //             Alert.alert('Google Sign In', data.error || 'Login failed');
    //         }
    //     } catch (error) {
    //         if (error.code === statusCodes.SIGN_IN_CANCELLED) {
    //             Alert.alert('Google Sign In', 'Sign in cancelled');
    //         } else {
    //             Alert.alert('Google Sign In', 'An error occurred');
    //             console.error('Google Sign-In Error:', error);
    //         }
    //     }
    // };

    useEffect(() => {
        // Check if the user is already signed in
        if (route.params?.signedIn) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });// Navigate to Home after successful login 
        }
    }, [route.params]); 
    const handleSignIn = async () => {
        // Check if all fields are filled
        if (!password || !identifier) {
            Alert.alert('Sign Up', 'Please fill all the fields!');
            return;
        }

        setLoading(true); // Show loading indicator

        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier,
                    password
                }),
            });
            const data = await response.json();

            setLoading(false); // Hide loading indicator

            if (!response.ok) {
                Alert.alert('Sign In', data.error || 'Login Failed');
            } else {
                await AsyncStorage.setItem('userData', JSON.stringify(data)); // Store userData
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                  });// Navigate to Home after successful login 
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
           <Text style={styles.title}>Sign In</Text>
            {/*SIgnUp Image */}
            <View style={styles.imageContainer}>
            <LottieView 
                style={{width: 200, height: 200}} 
                source={require('../../assets/Location_Pin.json')} 
                autoPlay 
                loop/>
                </View> 
                <View style={styles.contentContainer}>
                {/*inputs */}
                <TouchableOpacity  style={styles.googleButton}>
                    <Image source={require('../../assets/google_logo.png')} style={styles.googleLogo} />
                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </TouchableOpacity>
                <Text style={styles.title2}>Or</Text>

                <View style={styles.inputRow}>
                    <Feather name="user"size={hp(2.7)} color='gray' />
                    <TextInput
                    value={identifier}
                    onChangeText={setIdentifier}
                    style={styles.input}
                    placeholder='Username or email'
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
                    <Text style={styles.signUpText}>Don't have an account? </Text>
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
        top: 30,
        fontSize: hp(4), 
        fontWeight: 'bold', 
        letterSpacing: 1.5, // Add letter spacing
        textAlign: 'center', 
        color: '#333', // Dark gray color
    },
    // Styles for the or text
    title2: {
        fontSize: hp(2), 
        fontWeight: 'bold', 
        letterSpacing: 1.5, // Add letter spacing
        textAlign: 'center', 
        color: '#333', // Dark gray color
    },
     // Styles for the Google sign-in button
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e5e5e5',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(5),
        borderRadius: 30,
        marginBottom: hp(2),
    },
    googleLogo: {
        width: hp(3),
        height: hp(3),
        marginRight: wp(3),
    },
    googleButtonText: {
        color: '#333',
        fontSize: hp(2.5),
        fontWeight: 'bold',
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
        backgroundColor: '#f2f2f2', // Light gray background
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
        backgroundColor: '#e7c8A0', // Indigo-500
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
        color: '#e7c8A0', // Indigo-500
    },
});
export default SignIn;