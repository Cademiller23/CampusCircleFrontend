import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const { width, height } = Dimensions.get('window');

const AllComments = ({ route, navigation }) => {
    const { comments } = route.params;
    const animatedValues = comments.map(() => useRef(new Animated.ValueXY({ x: 0, y: 0 })).current);

    useEffect(() => {
        const animations = animatedValues.map((anim, index) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: { x: Math.random() * width - 50, y: Math.random() * height - 50 },
                        duration: 2000 + index * 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: { x: Math.random() * width - 50, y: Math.random() * height - 50 },
                        duration: 2000 + index * 1000,
                        useNativeDriver: true,
                    }),
                ])
            )
        );
        Animated.stagger(200, animations).start();
    }, []);

    const handleClose = () => {
        navigation.goBack(); // Go back to the previous screen
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            {comments.map((comment, index) => (
                <Animated.View key={index} style={[styles.bubble, { transform: animatedValues[index].getTranslateTransform() }]}>
                    <Text style={styles.text}>{comment.text}</Text>
                </Animated.View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10, // Ensure the button is above all other elements
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 15,
        padding: 5,
    },
    bubble: {
        position: 'absolute',
        backgroundColor: '#007AFF',
        padding: 20,
        borderRadius: 25,
        elevation: 5,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AllComments;