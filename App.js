import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import HomeScreen from './Home';
import SecondScreen from './SecondScreen';
import FitnessPlanSetup from './FitnessPlanSetup';
import Settings from './Settings';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import FitnessPlan from './FitnessPlan';
import FlashMessage from 'react-native-flash-message';
import AddWater from './AddWater';
import AddFood from './AddFood';
import AddWorkout from './AddWorkout';
import WorkoutPage from './WorkoutPage';
import DayPlanner from './DayPlanner';
import ProfilePage from './ProfilePage';
import FoodPage from './FoodPage';
import RecipePage from './RecipePage';
import LifestyleScorePage from './LifestyleScorePage';

const Stack = createNativeStackNavigator();
SplashScreen.preventAutoHideAsync();

async function loadFonts() {
  await Font.loadAsync({
    'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
    'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
    'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
    'Poppins': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
  });
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await loadFonts();
      } catch (e) {
        console.error(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => { 
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
  <NavigationContainer onReady={onLayoutRootView}>
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SecondScreen" component={SecondScreen} />
      <Stack.Screen name="FitnessPlanSetup" component={FitnessPlanSetup} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="LoginPage" component={LoginPage} />
      <Stack.Screen name="SignupPage" component={SignupPage} />
      <Stack.Screen name="FitnessPlan" component={FitnessPlan} />
      <Stack.Screen name="AddWater" component={AddWater} />
      <Stack.Screen name="AddFood" component={AddFood} />
      <Stack.Screen name="AddWorkout" component={AddWorkout} />
      <Stack.Screen name="WorkoutPage" component={WorkoutPage} />
      <Stack.Screen name="DayPlanner" component={DayPlanner} />
      <Stack.Screen name="ProfilePage" component={ProfilePage} />
      <Stack.Screen name="FoodPage" component={FoodPage} />
      <Stack.Screen name="RecipePage" component={RecipePage} />
      <Stack.Screen name="LifestyleScorePage" component={LifestyleScorePage} />
    </Stack.Navigator>
    <FlashMessage position="bottom" />
  </NavigationContainer>

  );
}
