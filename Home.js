import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
    const navigation = useNavigation();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        // user is signed in
        navigation.navigate('SecondScreen'); // navigate to second screen if user is logged in
      } else {
        // user is signed out
        navigation.navigate('Home'); // navigate home if signed out
      }
    })

  return (
    <View style={styles.container}>
      <Image source={require('./assets/dumbbell.png')} style={styles.dumbbellImage} />
      <Text style={styles.gymPalText}>Gym Pal</Text>
      <Text style={styles.simplifyText}>Simplify the Path to a Healthy Life</Text>
      <Image source={require('./assets/gymbro.png')} style={styles.gymBro} />
      <View style={styles.lowerSection}>
        <Pressable style={styles.getStartedButton} onPress={() => navigation.navigate('LoginPage')}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7FCDFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dumbbellImage: {
    width: 45,
    height: 45,
    marginBottom: 1,
    marginTop: 100
  },
  gymPalText: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: 36,
  },
  simplifyText: {
    color: '#000',
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    marginTop: 17,
  },
  gymBro: {
    width: 430,
    height: 290,
    marginTop: 90,
    zIndex: 1,
  },
  lowerSection: {
    width: '100%', 
    flex: 1, 
    backgroundColor: '#79B3E1',
    alignItems: 'center', 
    paddingTop: 20,
    marginTop: -127.5,
  },
  getStartedButton: {
    width: 301,
    height: 56,
    backgroundColor: '#FF715B',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 220,
    marginBottom: 20,
    borderRadius: 28,
  },
  getStartedButtonText: {
    color: '#000',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
});
