import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LifestyleScorePage({ route }) {
  const navigation = useNavigation();
  const { userData, userGoals, lifestyleScore } = route.params;

  const waterIntakePercentage = (userGoals.currentWaterIntake / userGoals.waterIntake) * 100;
  const caloriesPercentage = (userGoals.currentCalories / userGoals.calories) * 100;
  const workoutsPercentage = (userGoals.currentWorkouts / userGoals.workouts) * 100;

  const handleWorkoutRecommendation = () => {
    let targetDifficulty = userData.experienceLevel.toLowerCase();
  
    const workoutPointsNeeded = userGoals.workouts - userGoals.currentWorkouts; 

    const workoutDifficultyValues = {
      beginner: 1,
      intermediate: 1.5,
      expert: 2
    };

    if (workoutPointsNeeded > workoutDifficultyValues[targetDifficulty]) {
      const nextLevel = (targetDifficulty === 'beginner') ? 'intermediate' : 'expert'; 
  
      if (workoutPointsNeeded <= workoutDifficultyValues[nextLevel] ||
         userData.experienceLevel === 'expert') { 
        targetDifficulty = nextLevel;
      }
    }
  
    navigation.navigate('WorkoutPage', {
      selectedValue: 'difficulty',
      difficulty: targetDifficulty
    });
  };

  const formatDate = (date) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Your Lifestyle Score</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.hintText}>{formatDate(new Date())}</Text>
        <Text style={styles.scoreTitle}>Overall Lifestyle Score: {lifestyleScore.toFixed(2)}%</Text> 
        <View style={styles.goalSection}>
          <Text style={styles.goalLabel}>Water Intake:</Text>
          <Text style={styles.goalValue}>{userGoals.currentWaterIntake.toFixed(2)} / {userGoals.waterIntake.toFixed(2)} ({Math.min(waterIntakePercentage.toFixed(0), 100)}%)</Text>
        </View>
        <View style={styles.goalSection}>
          <Text style={styles.goalLabel}>Calories:</Text>
          <Text style={styles.goalValue}>{userGoals.currentCalories.toFixed(2)} / {userGoals.calories.toFixed(2)} ({Math.min(caloriesPercentage.toFixed(0), 100)}%)</Text>
        </View>
        <View style={styles.goalSection}>
          <Text style={styles.goalLabel}>Workouts:</Text>
          <Text style={styles.goalValue}>{userGoals.currentWorkouts} / {userGoals.workouts} ({Math.min(workoutsPercentage.toFixed(0), 100)}%)</Text>
        </View>

        <View style={styles.buttonContainer}>  
          <Pressable style={styles.recommendButton} onPress={() => handleWorkoutRecommendation()}>
            <Text style={styles.recommendButtonText}>Get Recommended Workouts</Text>
          </Pressable>
        </View>

        <View style={styles.hintTextContainer}>
          <Text style={styles.hintText}>NOTE: Reopen this page to view updated values!</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
  form: {
    flex: 1,
    paddingHorizontal: 50,
    marginTop: 20,
  },
  label: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
    color: '#70747E',
    marginTop: 10,
  },
  input: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    borderWidth: 1,
    borderColor: '#B0B0B0',
    borderRadius: 7.5,
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
  },
  createButtonContainer: {
    paddingHorizontal: 45,
    paddingVertical: 10,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  createButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 109,
    height: 31,
  },
  createButtonText: {
    color: '#FFF',
    fontFamily: 'Poppins',
    fontSize: 10,
    lineHeight: 16.5,
    paddingRight: 25,
  },
  button: {
    backgroundColor: '#FF715B',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  scoreTitle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10, 
  },
  goalSection: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  goalLabel: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500', 
    color: '#000',
  },
  goalValue: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  recommendButton: {
    backgroundColor: '#FF715B',
    padding: 15,
    borderRadius: 5,
  },
  recommendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold', 
  },
  hintTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  hintText: {
    fontFamily: 'Poppins',
  },
});
