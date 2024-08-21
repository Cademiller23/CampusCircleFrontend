// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import React, {useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import { CustomKeyboardView } from './../Components/CustomKeyboardView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native'
import { Octicons } from '@expo/vector-icons';
export function Verify({route}) {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false); // State for loading indicator
    const {email,password,username} = route.params;
    const [code, setCode] = useState(Array(6).fill('')); // Initialize array with 6 empty strings

    const handleChangeText = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Automatically move to the next input
        if (text && index < 5) {
            const nextInput = index + 1;
            this[`input_${nextInput}`].focus();
        }
    };
    
    const handleVerify = async () => {
        const codeString = code.join('');
        // Check if all fields are filled
        if (!code || code.length !== 6) { //INSERT CODE SIZE
            Alert.alert('Verify', 'Please enter the 6-digit verification code');
            return;
        }
        setLoading(true); // Show loading indicator

        try {
            const response = await fetch('http://127.0.0.1:5000/verify_email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email, code: codeString
                }),
            });
            const data = await response.json();
            setLoading(false); // Hide loading indicator

            if (!response.ok) {
                Alert.alert('Verify', data.error || 'Verification Failed');
            } else {
        
                Alert.alert('Success', 'Your email has been verified!');
                navigation.navigate('ProfileSetup', { userId: data.user_id });
            }
        } catch (error) {
            setLoading(false); // Hide loading indicator
            Alert.alert('Error', 'An error occurred during registration.');
            console.error('Registration error:', error); 
        }
    };

   
    return (
      
           <View style={styles.container}>  
           <Text style={styles.title}>Verify</Text>
            {/*SIgnUp Image */}
            <View style={styles.imageContainer}>
            <LottieView 
                style={{width: 200, height: 180}} 
                source={require('../../assets/university_pin.json')} 
                autoPlay 
                loop/>
                </View> 
                <View style={styles.contentContainer}>
                <Text style={styles.title2}>Enter the Verification Code</Text>
                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            value={digit}
                            onChangeText={(text) => handleChangeText(text, index)}
                            style={styles.codeInput}
                            keyboardType="numeric"
                            maxLength={1}
                            ref={(input) => (this[`input_${index}`] = input)}
                        />
                    ))}
                </View>
                <TouchableOpacity onPress={handleVerify} style={styles.verifyButton}>
                    <Text style={styles.buttonText}>Verify</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
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
        flex: 4,
        gap: 5,
    },
    // Styles for the title text
    title: {
        fontSize: hp(4), 
        top: 35,
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
        backgroundColor: '#e7c8A0', // Indigo-500
        borderRadius: 20, // Slightly rounded corners
        justifyContent: 'center',
        alignItems: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: hp(2),
    },
    codeInput: {
        width: wp(12),
        height: hp(6),
        borderWidth: 1,
        borderColor: '#333',
        textAlign: 'center',
        fontSize: hp(2.5),
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
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
        color: '#e7c8A0', // Indigo-500
    },
    verifyButton: {
        height: hp(6.5),
        backgroundColor: '#e7c8A0',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default Verify;