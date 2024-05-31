import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import ProfileSetup from './src/Screens/ProfileSetup';
import SignIn from './src/Screens/SignIn';
import SignUp from './src/Screens/SignUp';
export default function App() {
  return (
    <View style={styles.container}>
   <SignIn />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
  },
});
