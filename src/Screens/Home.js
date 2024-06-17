import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, {useState, useRef, useEffect, useMemo} from 'react';
import {View, StyleSheet, Alert, Text, ScrollView, Pressable, FlatList, Image, Animated, Dimensions,Modal, Easing, TouchableOpacity} from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from '../Components/Loading';
const {width} = Dimensions.get('window');
const NUM_COLUMNS = 100000;
const GRID_CARD_CONTAINER_PADDING_HORIZONTAL = 2; // Padding within the container
const ITEM_MARGIN = 2;
const MAX_GRID_HEIGHT = 314; // Set your desired max height here

const Divider = () => {
    return (
        <View style={styles.divider} />
    );
};

export default function Home({route}) {
    const [userData, setUserData] = useState(null); 
    const [profileImage, setProfileImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const itemWidth = (width - 2 * GRID_CARD_CONTAINER_PADDING_HORIZONTAL - (NUM_COLUMNS - 1) * ITEM_MARGIN) / NUM_COLUMNS;
    const userId  = route?.params?.userId;
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                    const response = await fetch('http://127.0.0.1:5000/users/me'); //Fetch by ID ; // Fetch by ID
                    console.log(response)
                    if(response.ok) {
                        const userData = await response.json();
                        console.log(userData)
                        setUserData(userData);
                        setProfileImage(`http://127.0.0.1:5000${userData.profile_picture}`);
    
                    } else {
                        throw new Error('User data not found');
                    }
               
            } catch (error) {
                Alert.alert('Error', 'An error occured while fetching user data.')
                console.error(error);
            }  finally {
                setIsLoading(false);
            }
        };
  
            fetchUserData();
   
     
    }, []);
    // Sample data for the FlatLists 
    const gridData = Array.from({length: 100}, (_, index) => ({
        id: index + 1, 
        source: require('./../../assets/Cade.jpeg')
    }));

    return (
        <View style={styles.container}>
            <ScrollView>
            <View style={styles.headerProfileContainer}>
              {isLoading ? (
                    <Loading /> 
                ) : userData ? ( 
                    <View stle={styles.Homeheader}>
                        <Image
                            source={profileImage ? { uri: profileImage } : require('./../../assets/Cade.jpeg')} // Fallback image
                            style={styles.profileImage} 
                        />
                        <View style={styles.userInfoContainer}>
                            <Text style={styles.username}>{userData.username}</Text>
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Upvotes:</Text>
                                    <Text style={styles.statValue}>2{/*UPVOTE COUNTER */}</Text>
                                </View>
                                <View style={styles.statItem}>
                                     <Text style={styles.statLabel}>Posts:</Text>
                                      <Text style={styles.statValue}>2{/* Add post count here */}</Text>
                              </View>
                          </View>
                            </View>
                    </View>
                ) : (
                    <Text>No user data available</Text> // Display message if userData is still null after loading
                )}
                </View>
       <View style={[styles.gridCardContainer, {maxHeight: MAX_GRID_HEIGHT}]}>
        <TouchableOpacity style={styles.galleryHeader}>
            <Text style={styles.galleryText}>Gallery...</Text>
        <Entypo name="arrow-with-circle-right" size={24} color='black' />
        </TouchableOpacity>
        <Divider/>
       <ScrollView>
           <FlatList
           data={gridData}
           renderItem={({ item}) => (
            <View style={[styles.gridItem, {width: 50, height: 50 }]}>
                <Image source={item.source}style={styles.gridImage} />
            </View>
           )}
           keyExtractor={item => item.id.toString()}
           numColumns={NUM_COLUMNS}
           contentContainerStyle={styles.flatListContentContainer}
         />
         </ScrollView>
       
        </View>
        <View style={styles.gridCardContainer}>
        <TouchableOpacity style={styles.galleryHeader}>
            <Text style={styles.galleryText}>All Saved...</Text>
        <Entypo name="arrow-with-circle-right" size={24} color='black' />
        </TouchableOpacity>
        </View> 
        <View style={styles.gridCardContainer}>
        <TouchableOpacity style={styles.galleryHeader}>
            <Text style={styles.galleryText}>All Comments...</Text>
        <Entypo name="arrow-with-circle-right" size={24} color='black' />
        </TouchableOpacity>
        </View> 
        </ScrollView>
        </View>
    );
          
}

const styles = StyleSheet.create ({
    Homeheader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16
    },
    profileImage: {
        width: 80,
        height: 80, 
        borderRadius: 40,
        marginRight: 16,
    },
    userInfoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    username: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    statsContainer: {
        flexDirection: 'row',
    },
    statItem: {
        marginRight: 20,
    },
    statLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,

    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        marginTop: 40,
        backgroundColor: 'white'
    },
    galleryHeader: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        padding: 4
    },
     divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'neutral-200',
    },
    galleryText: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerProfileContainer: {  
        height: 200,
        backgroundColor: '#f2f2f2',
        marginHorizontal: 12,
        borderRadius: 20,
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        
        // Add Drop Shadow
        shadowColor: 'black', // Color of the shadow
        shadowOffset: { width: 0, height: 2 }, // Shadow offset (horizontal, vertical)
        shadowOpacity: 0.3, // Shadow opacity (0-1)
        shadowRadius: 3, // Shadow blur radius
    },  gridCardContainer: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        margin: 12,
        borderRadius: 20,
        padding: 20,
        // Add Drop Shadow
        shadowColor: 'black', // Color of the shadow
        shadowOffset: { width: 0, height: 2 }, // Shadow offset (horizontal, vertical)
        shadowOpacity: 0.3, // Shadow opacity (0-1)
        shadowRadius: 3, // Shadow blur radius
    },profilePhotoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    rowHeader: {
        flexDirection: 'row',
    },
    rowHeaderText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#6366f1',
    },iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Key for positioning
        alignItems: 'center',
        marginTop: 20,
      },
      icon: {
      paddingHorizontal: 20,
        // Add Drop Shadow
        shadowColor: '#6366f1', // Color of the shadow
        shadowOffset: { width: 0, height: 2 }, // Shadow offset (horizontal, vertical)
        shadowOpacity: 0.6, // Shadow opacity (0-1)
        shadowRadius: 3, // Shadow blur radius
      },
      gridItem: {
        marginBottom: ITEM_MARGIN,
        marginHorizontal: ITEM_MARGIN / 2, // Half margin on each side
        borderRadius: 10,
        overflow: 'hidden', // Clip the image to the rounded corners
    },gridImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    
    flatListContentContainer: {
        paddingHorizontal: ITEM_MARGIN / 2, // Half margin on each side
    }, modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darken background
    },
    modalImage: {
        width: '90%',
        height: '80%',
        resizeMode: 'contain', // Maintain aspect ratio
    },
    closeButton: {
        marginTop: 20,
        padding: 1
    },
});