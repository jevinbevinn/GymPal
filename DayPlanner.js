import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDoc, doc, getDocs, collection, query } from 'firebase/firestore/lite';
import { auth, db } from './firebase';
import Collapsible from 'react-native-collapsible';

export default function DayPlanner({ route }) {
  const navigation = useNavigation();
  const { date } = route.params;

  const [waterIntake, setWaterIntake] = useState(null);
  const [meals, setMeals] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (date) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const fetchUserData = async () => {
    setIsLoading(true);

    try {
      const dateString = date.toISOString().split('T')[0];
      const waterRef = doc(db, "users", auth.currentUser.uid, "data", "hydration", dateString, "water");
      const waterDoc = await getDoc(waterRef);

      if (waterDoc.exists()) {
        setWaterIntake(waterDoc.data().oz);
      } else {
        setWaterIntake(0);
      }

      const mealsRef = collection(db, "users", auth.currentUser.uid, "data", "meals", dateString);
      const mealsQuery = query(mealsRef);
      const mealsSnapshot = await getDocs(mealsQuery);

      const newMeals = mealsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const [expandedIds, setExpandedIds] = useState([]);
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState([]);

  const toggleExpand = (mealId) => {
    if (expandedIds.includes(mealId)) {
        setExpandedIds(expandedIds.filter(id => id !== mealId)); 
    } else {
        setExpandedIds([...expandedIds, mealId]);
    }
  };

  const toggleExpandWorkout = (workoutId) => {
    if (expandedWorkoutIds.includes(workoutId)) {
      setExpandedWorkoutIds(expandedWorkoutIds.filter(id => id !== workoutId)); 
    } else {
      setExpandedWorkoutIds([...expandedWorkoutIds, workoutId]);
    }
  };

  //meal description doesnt show up rn not sure why i think might have to do with how its stored in firebase
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.navigate("SecondScreen")}>
            <Text style={styles.backButtonText}>{"<"}</Text>
          </Pressable>
          <Text style={styles.title}>Day Overview ({formatDate(date)})</Text>
        </View>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <View>
            <Text style={styles.detailLabel}>
              You've drank {waterIntake.toFixed(2)} oz of water this day!
            </Text>


            <Text style={styles.headerText}>Meals:</Text>
            {meals.length > 0 ? (
              meals.map(meal => (
                <View key={meal.id} style={styles.mealContainer}>
                  <Pressable onPress={() => toggleExpand(meal.id)}>
                    <Text>Description: </Text>
                    <Text style={styles.mealText}>{meal.mealDescription}</Text>
                    <Text>Calories: </Text>
                    <Text style={styles.mealText}>{meal.calories}</Text>
                    <Text>Time: </Text>
                    <Text style={styles.mealText}>
                      {new Date(meal.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit' 
                      })}
                    </Text>
                  </Pressable>

                  <Collapsible collapsed={!expandedIds.includes(meal.id)}> 
                    <Text>Servings: </Text>
                    <Text style={styles.mealText}>{meal.servings}</Text>
                    <Text>Carbs: </Text>
                    <Text style={styles.mealText}>{meal.carbs} g</Text>
                    <Text>Fat: </Text>
                    <Text style={styles.mealText}>{meal.fat} g</Text>
                    <Text>Protein: </Text>
                    <Text style={styles.mealText}>{meal.protein} g</Text>
                    <Text>Sodium: </Text>
                    <Text style={styles.mealText}>{meal.sodium} mg</Text>
                  </Collapsible>
                </View>
              ))
            ) : (
                <Text>No meals logged for today.</Text>
            )}
            
            <Text style={styles.headerText}>Workouts:</Text>
              {workouts.length > 0 ? (
                workouts.map(workout => (
                  <View key={workout.id} style={styles.workoutContainer}>
                    <Pressable onPress={() => toggleExpandWorkout(workout.id)}>
                      <Text>Description: </Text>
                      <Text style={styles.workoutText}>{workout.workoutDescription}</Text>
                      <Text>Type: </Text>
                      <Text style={styles.workoutText}>{workout.type}/{workout.muscle}</Text>
                      <Text>Time: </Text>
                      <Text style={styles.mealText}>
                        {new Date(workout.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit' 
                        })}
                      </Text>
                    </Pressable>

                    <Collapsible collapsed={!expandedWorkoutIds.includes(workout.id)}> 
                      <Text>Difficulty: </Text>
                      <Text style={styles.workoutText}>{workout.difficulty}</Text> 
                      <Text>Instructions: </Text>
                      <Text style={styles.workoutText}>{workout.instructions}</Text> 
                    </Collapsible>
                  </View>
                ))
              ) : (
                <Text>No workouts logged for today.</Text>
              )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20, 
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontFamily: 'Poppins',
    fontSize: 25,
    fontWeight: '700',
    color: '#000',
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  loadingText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#000',
    alignSelf: 'center',
    marginTop: 20,
  },
  detailLabel: {
    color: '#060302',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  mealContainer: {
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  mealText: {
    color: '#060302',
    fontFamily: 'Poppins',
    fontSize: 16,
    marginBottom: 5,
  },
  headerText: {
    color: '#060302',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  workoutContainer: {
    backgroundColor: '#F4F4F4',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  workoutText: {
    color: '#060302',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
});
