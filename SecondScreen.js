import { React, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ImageBackground} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from './firebase';
import { getDoc, doc, getDocs, collection, query } from 'firebase/firestore/lite';
import FloatingButton from './FloatingButton';

export default function SecondScreen() {
  const navigation = useNavigation();

  const [userData, setUserData] = useState(null);
  const [waterIntake, setWaterIntake] = useState(null);
  const [meals, setMeals] = useState([]);
  const [lifestyleScore, setLifestyleScore] = useState(0);
  const [workouts, setWorkouts] = useState([]);
  const [userGoals, setUserGoals] = useState({
    waterIntake: 88,
    calories: 0,
    workouts: 0,
    currentWaterIntake: 0,
    currentCalories: 0,
    currentWorkouts: 0,
    hasLoggedWorkout: false,
  });


  const fetchUserData = async () => {
    console.log("Getting user info")
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
      const day = ('0' + currentDate.getDate()).slice(-2);
      const dateString = year + '-' + month + '-' + day; // YYYY-MM-DD format

      // get user data
      const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (docSnap.exists()) {
        setUserData(docSnap.data())
      } else {
        console.log("No such document!");
      }

      // Fetch water data
      const waterRef = doc(db, "users", auth.currentUser.uid, "data", "hydration", dateString, "water");
      const waterDoc = await getDoc(waterRef);

      if (waterDoc.exists()) {
        setWaterIntake(waterDoc.data().oz);
      } else {
        setWaterIntake(0);
      }

      // Fetch meal data
      const mealsRef = collection(db, "users", auth.currentUser.uid, "data", "meals", dateString);
      const mealsQuery = query(mealsRef);
      const mealsSnapshot = await getDocs(mealsQuery);

      const newMeals = mealsSnapshot.docs.map(doc => ({
        id: doc.id,  // Get the meal ID
        ...doc.data(),  // Extract the mealData
      }));
      setMeals(newMeals);

      const workoutsRef = collection(db, "users", auth.currentUser.uid, "data", "workouts", dateString);
      const workoutsQuery = query(workoutsRef);
      const workoutsSnapshot = await getDocs(workoutsQuery);

      const newWorkouts = workoutsSnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
      }));
      setWorkouts(newWorkouts);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchDays = () => {
      const currentDate = new Date();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let days = [];
      let daysNum = [];
      let dates = [];

      for (let i = 0; i <= 4; i++) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() + i);
          days.push(dayNames[date.getDay()]);
          daysNum.push(date.getDate());
          dates.push(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
      }

      return { days, daysNum, dates };
  };

  const { days, daysNum, dates } = fetchDays();
  const currentDate = new Date().getDate();

  const handlePress = (date) => {
    navigation.navigate('DayPlanner', {date});
  };

  const handleProfilePress = () => {
    navigation.navigate('ProfilePage');
  };
  
  function calculateFitnessProgress() {
    let goal = 0;
    workouts.forEach((workout) => {
      level = workout.difficulty;

      if (level === 'beginner') {
        goal += 1
      } else if (level === 'untermediate') {
        goal += 1.5
      } else {
        goal += 2
      }
    });
    return goal;
  }

  function calculateCalorieGoal() {
    // Extract data from userData object
    const { age, gender, weight, height, activityLevel } = userData;

    // Calculate BMR based on gender
    let bmr;
    if (gender.toLowerCase() === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender.toLowerCase() === 'female') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age); // default
    }

    // Adjust BMR based on activity level
    let activityFactor = 1;
    switch (activityLevel) {
        case '1-2 times per week':
            activityFactor = 1.2;
            break;
        case '2-3 times per week':
            activityFactor = 1.375;
            break;
        case '3-4 times per week':
            activityFactor = 1.55;
            break;
        case '5-6 times per week':
            activityFactor = 1.725;
            break;
        case '6-7 times per week':
            activityFactor = 1.9;
            break;
    }

    // Calculate calorie goal
    const calorieGoal = Math.round(bmr * activityFactor);
    return calorieGoal;
  }

  const calculateLifestyleScore = () => {
    let waterDrank = Math.min(1, waterIntake / 88);
    let totalCalories = 0;
    let calorieGoal = calculateCalorieGoal();
    let activity = calculateFitnessProgress();
    let fitnessGoal = 0;

    if (userData.experienceLevel === "beginner") {
      fitnessGoal = 3;
    } else if (userData.experienceLevel === "intermediate") {
      fitnessGoal = 4.5;
    } else {
      fitnessGoal = 6;
    }

    meals.forEach((meal) => {
      totalCalories += meal.calories;
    });
  
    let calorieProgress = Math.min(1, totalCalories / calorieGoal);
    let fitnessProgress = Math.min(1, activity / fitnessGoal);

    let exercise = 0;
    if (workouts[0]) {
      exercise = 1;
    }

    // weightings
    let weightedWater = waterDrank * 0.4;
    let weightedCalories = calorieProgress * 0.4;
    let weightedExercise = fitnessProgress * 0.2;

    setUserGoals({
      waterIntake: 88,
      calories: calorieGoal,
      workouts: fitnessGoal,
      currentWaterIntake: waterDrank,
      currentCalories: totalCalories,
      currentWorkouts: activity,
      hasLoggedWorkout: workouts.length > 0,
    });

    return (weightedWater + weightedCalories + weightedExercise) * 100;
  };

  useEffect(() => {
    if (userData && userData.fitnessPlanSetup) {
      const lifestyleScore = calculateLifestyleScore();
      // Update lifestyle score in state
      setLifestyleScore(lifestyleScore);
    }
  }, [waterIntake, meals, workouts]);
  
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        fetchUserData();
      }
      refreshData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text style={styles.helloAnakin}>Hello, {auth.currentUser.displayName}</Text>
          <Text style={styles.helloAnakinSubtitle}>What did you workout today?</Text>
        </View>

        <Pressable style={styles.settingsIcon} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={30} />
        </Pressable>

        <Pressable style={styles.profileIcon} onPress={handleProfilePress}>
          <Ionicons name="person-circle-outline" size={32} /> 
        </Pressable> 
      </View>

      <View style={styles.lifestyleScoreContainer}>
        <Text style={styles.lifestyleScoreText}>Lifestyle Score</Text>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, {width: `${lifestyleScore}%`}]} />
          </View>
          <Text style={styles.lifestyleScorePercentage}>{lifestyleScore.toFixed(2)}%</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('LifestyleScorePage', { userData: userData, userGoals: userGoals, lifestyleScore: lifestyleScore })}>
          <Text style={[styles.lifestyleScorePercentage, {fontStyle:"italic"}]}>What does this mean?</Text>
        </Pressable>
      </View>
      <View style={styles.rectangle}>
        <Text style={styles.rectangleText}>View your fitness plan today!</Text>
        <Pressable onPress={() => navigation.navigate('FitnessPlan')}>
          <ImageBackground source={require('./assets/button.png')} style={styles.startButton} resizeMode="contain">
            <Text style={styles.startButtonText}>START</Text>
          </ImageBackground>
        </Pressable>
        <Image
          source={require('./assets/man.gif')}
          style={styles.weightliftingMan}
        />
      </View>

      <Text style={styles.fitnessActivitiesTitle}>My Fitness Activities</Text>
      <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, marginTop: 20, flexWrap: 'wrap' }}>
        {days.map((day, index) => (
          <Pressable 
            key={index} 
            style={[styles.dayRectangle, daysNum[index] === currentDate && styles.dayRectangleSelected]}
            onPress={() => handlePress(dates[index])}
          >
            <Text style={[styles.dayText, daysNum[index] === currentDate && styles.dayTextSelected]}>{day}</Text>
            <View style={styles.circle}>
              <Text style={[styles.dayTextNum, daysNum[index] === currentDate && styles.dayTextNumSelected]}>{daysNum[index]}</Text>
            </View>
          </Pressable>
        ))}
      </View>
      

      {/* COOL FLOATING ACTION BUTTON!! */}
      <FloatingButton style={{ bottom: 120, right: 80}} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  buttonContainer: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  helloAnakin: {
    color: '#060302',
    fontFamily: 'Poppins',
    fontSize: 25,
    fontWeight: '600',
  },
  helloAnakinSubtitle: {
    color: '#70747E',
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
  },
  settingsIcon: {
    marginRight: 10,
  },
  loginButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 10,
  },
  loginButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Poppins',
      fontWeight: '600',
  },
  rectangle: {
    width: '90%',
    height: 145,
    backgroundColor: '#7FCDFE',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 30,
    position: 'relative',

    // shadow
    shadowColor: "#501f72",
    shadowOffset: {
      width: 9,
      height: 18,
    },
    shadowOpacity: 0.2,
    shadowRadius: 13,
  },
  rectangleText: {
    color: '#191919',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 140,
  },
  startButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 103.83,
    height: 30.79,
    marginTop: 15,
  },
  startButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins',
    fontSize: 11,
    lineHeight: 16.5,
    paddingRight: 45,
  },
  weightliftingMan: {
    position: 'absolute',
    right: 40,
    bottom: 30,
    width: 92, 
    height: 100, 
    paddingLeft: 20,
    marginTop: 50,
    marginLeft: 100,
  },
  workoutQuestion: {
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  
  rectangleText: {
    color: '#191919',
    fontFamily: 'Lato-Bold',
    fontSize: 20,
    width: '60%',
  },
  
  fitnessActivitiesTitle: {
    width: 269,
    height: 29,
    color: '#060302',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
    alignSelf: 'flex-start',
    marginLeft: 20, 
    marginTop: 75,
    marginBottom: -5,
  },
  
  dayRectangleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    alignItems: 'center',
    width: '100%',
  },
  dayRectangle: {
    flexGrow: 1,
    width: 55.45,
    height: 88.806,
    backgroundColor: 'rgba(105, 105, 105, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 10,
  },

  dayRectangleSelected: {
    flexGrow: 1,
    width: 55.45,
    height: 88.806,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 10,
  },
  
  dayText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
  },

  dayTextSelected: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#fff'
  },

  dayTextNum: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
  },

  dayTextNumSelected: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: '#2F80ED',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 26.27,
    height: 26.27,
    borderRadius: 26.27 / 2, 
    backgroundColor: '#FFFFFF', 
    marginTop: 10,
  },
  profileIcon: {
    marginRight: 10,
  },
  button: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  lifestyleScoreContainer: {
    alignSelf: 'flex-start',
    width: '90%',
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 20,
  },
  lifestyleScoreText: {
    fontSize: 20,
    marginTop: -7,
    marginBottom: 10,
    color: '#060302',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressBarBackground: {
    height: 20,
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginRight:10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2F80ED', 
    borderRadius: 10,
  },
  lifestyleScorePercentage: {
    color: '#2F80ED',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
});
