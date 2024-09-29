import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getDoc, doc } from 'firebase/firestore/lite';
import { auth, db } from './firebase';
import { Picker } from '@react-native-picker/picker';

export default function FitnessPlan() {
  const navigation = useNavigation();
  const [fitnessPlan, setFitnessPlan] = useState(null);
  const [selectedValue, setSelectedValue] = useState('type');
  const [confirmDisabled, setConfirmDisabled] = useState(true); // State to control confirm button disabled status

  useEffect(() => {
    const fetchFitnessPlan = async () => {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().fitnessPlanSetup) {
        setFitnessPlan(userDoc.data());
      } else {
        console.log('Fitness plan not found');
        navigation.navigate('FitnessPlanSetup'); 
      }
    };

    fetchFitnessPlan();
  }, []);

  useEffect(() => {
    // Enable confirm button only if a value is selected
    setConfirmDisabled(selectedValue === '');
  }, [selectedValue]);

  const handleConfirmSelection = () => {
    console.log("Selected Value:", selectedValue);
    navigation.navigate('WorkoutPage', { selectedValue }); 
  };

  const handleConfirmSelectionFood = () => {
    navigation.navigate('FoodPage'); 
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate("SecondScreen")}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Your Fitness Plan</Text>
      </View>

      {fitnessPlan ? (
        <View style={styles.content}>
          <View style={styles.contentContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Age:</Text>
              <Text style={styles.detailValue}>{fitnessPlan.age}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Gender:</Text>
              <Text style={styles.detailValue}>{fitnessPlan.gender}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight:</Text>
              <Text style={styles.detailValue}>{fitnessPlan.weight} kg</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Height:</Text>
              <Text style={styles.detailValue}>{fitnessPlan.height} cm</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Level of Experience:</Text>
              <Text style={styles.detailValue}>{fitnessPlan.experienceLevel}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Activity Level:</Text>
              <Text style={styles.detailValue}>{fitnessPlan.activityLevel}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>How would you like to train: by</Text>
              <Picker
                selectedValue={selectedValue}
                style={{ height: 50, width: 150 }}
                onValueChange={(itemValue, itemIndex) =>
                  setSelectedValue(itemValue)
                }>
                <Picker.Item label="workout type" value="type" />
                <Picker.Item label="body part" value="muscle" />
                <Picker.Item label="difficulty" value="difficulty" />
              </Picker>
            </View>

            <Pressable style={styles.confirmButton} onPress={handleConfirmSelection}>
                <Text style={styles.confirmButtonText}>View Workouts</Text>
            </Pressable>
            <Pressable style={[styles.confirmButton, {backgroundColor:"#FF715B"}]} onPress={handleConfirmSelectionFood}>
                <Text style={styles.confirmButtonText}>View Food and Recipes</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.loading}>
          <Text>Loading your fitness plan...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 80,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 50,
    marginTop: 20,
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
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center', // Vertically align label and value
    marginBottom: 15
  },
  detailLabel: {
    color: '#060302',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '500', // Maybe a bit bolder?
    marginRight: 10
  },
  detailValue: {
    color: '#060302', // Or a slightly subdued color like '#70747E'
    fontFamily: 'Poppins',
    fontSize: 16
  },
  pickerContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    width: 150,
    marginBottom: 10
  },
  picker: {
    height: 50,
    width: '100%',
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#060302'
  },
  confirmButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  confirmButtonText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600'
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
