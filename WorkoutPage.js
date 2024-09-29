import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from "@expo/vector-icons";
import { setDoc, doc } from 'firebase/firestore/lite';
import { auth, db } from './firebase';
import { showMessage } from 'react-native-flash-message';
import { Picker } from '@react-native-picker/picker';


export default function WorkoutPage({ route }) { 
  const navigation = useNavigation();
  const { selectedValue, difficulty } = route.params;

  const [selectedOption, setSelectedOption] = useState('');
  const [options, setOptions] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);

  useEffect(() => {
    if (selectedValue === 'type') {
      setOptions(['Cardio','Olympic_weightlifting','Plyometrics','Powerlifting','Strength','Stretching','Strongman']);
    } else if (selectedValue === 'muscle') {
      setOptions(['Abdominals','Abductors','Adductors','Biceps','Calves','Chest','Forearms','Glutes','Hamstrings','Lats','Lower_back','Middle_back','Neck','Quadriceps','Traps','Triceps']);
    } else if (selectedValue === 'difficulty') {
      setOptions(['Beginner', 'Intermediate', 'Expert']);
    }

    if (difficulty && selectedValue === 'difficulty') {
      handleOptionChange(difficulty); 
    } else {
      handleOptionChange(selectedOption);
    }
  }, [selectedValue, difficulty]);

  const handleOptionChange = (itemValue, itemIndex) => {
    setSelectedOption(itemValue);
    console.log('Selected option:', itemValue);

    fetch(`https://api.api-ninjas.com/v1/exercises?${selectedValue}=${itemValue}`, {
    method: 'GET',
    headers: {
      'X-Api-Key': API_KEY
    },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      setExerciseData(data);
    })
    .catch(error => {
      console.error('Request failed:', error);
    });
  };

  const logWorkoutToDB = async (workoutDescription, muscle, type, instructions, difficulty, date) => {
    try {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);
      const dateString = `${year}-${month}-${day}`;
      const workoutId = `workout_${date.getTime()}`;
      const workoutRef = doc(db, "users", auth.currentUser.uid, "data", "workouts", dateString, workoutId);
      await setDoc(workoutRef, {
        workoutDescription,
        muscle: muscle,
        type: type,
        instructions: instructions,
        difficulty: difficulty,
        timestamp: date.toISOString() 
      }, { merge: true });
  
      console.log("Workout logged successfully!");
      showMessage({
        message: "Workout logged successfully!",
        description: date.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}),
        type: "success",
      });
    } catch (err) {
      console.error("Error logging workout: ", err);
    }
  };

  const handleAddToDatabase = (exercise) => {
    const workoutDescription = exercise.name; 
    const muscle = exercise.muscle;
    const type = exercise.type;
    const instructions = exercise.instructions;
    const difficulty = exercise.difficulty;
    const date = new Date();
  
    logWorkoutToDB(workoutDescription, muscle, type, instructions, difficulty, date);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Your Workout Recommendation</Text>
      </View>

      <Text style={styles.fitnessActivitiesTitle}>Select your {selectedValue}</Text>
      <Picker
        selectedValue={selectedOption}
        style={styles.picker}
        onValueChange={handleOptionChange}>
        {options.map((option, index) => (
          <Picker.Item key={index} label={option.replace(/_/g, ' ')} value={option.replace(/_/g, ' ')} />
        ))}
      </Picker>

      {exerciseData && (
      <View style={styles.exerciseContainer}>
        <Text style={styles.exerciseTitle}>Exercise Recommendations:</Text>
        {exerciseData.map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name.replace(/_/g, ' ')}</Text>
            <Text>Type: {exercise.type.replace(/_/g, ' ')}</Text>
            <Text>Muscle: {exercise.muscle.replace(/_/g, ' ')}</Text>
            <Text>Equipment: {exercise.equipment}</Text>
            <Text>Difficulty: {exercise.difficulty}</Text>
            <Text style={styles.instructions}>{exercise.instructions}</Text>

            {/* Add Button */}
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => handleAddToDatabase(exercise)}> 
              <AntDesign name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
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
  fitnessActivitiesTitle: {
    color: '#060302',
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 20,
    marginTop: 75,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '80%',
    alignSelf: 'center',
  },
  exerciseContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc', // Optional: Add border color for a cleaner look
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructions: {
    marginTop: 10,
  },
  // spacing: {
  //   marginBottom: 10, // Adjust this value as needed
  // },
  addButton: {
    position: 'absolute',
    right: 10, 
    top: 10,  
    padding: 5, 
    backgroundColor: 'green',
    borderRadius: 5, 
  },
});
