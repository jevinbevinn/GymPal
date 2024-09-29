import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Picker, ScrollView, Pressable, TouchableOpacity, TextInput, Button } from 'react-native';
import { API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from "@expo/vector-icons";
import { setDoc, doc } from 'firebase/firestore/lite';
import { auth, db } from './firebase';
import { showMessage } from 'react-native-flash-message';


export default function FoodPage() { 
  const navigation = useNavigation();
  const [foodData, setFoodData] = useState([]);
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    fetch(`https://api.api-ninjas.com/v1/nutrition?query=${searchText}`, {
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
          setFoodData(data);
        })
        .catch(error => {
          console.error('Request failed:', error);
        });
    };

    const logMealToDB = async (mealDescription, calories, servingAmount, protein, sodium, carbs, fat, date) => {
        //check
        if (!date) {
            console.error("No date provided for logging meal.");
            return;
        }
        try {
            const year = date.getFullYear();
            const month = ('0' + (date.getMonth() + 1)).slice(-2);
            const day = ('0' + date.getDate()).slice(-2);
            const dateString = `${year}-${month}-${day}`;
            const mealId = `${mealDescription}_${date.getTime()}`;
            const mealRef = doc(db, "users", auth.currentUser.uid, "data", "meals", dateString, mealId);
            await setDoc(mealRef, {
                calories,
                servings: Number(servingAmount),
                protein: protein,
                sodium: sodium,
                carbs: carbs,
                fat: fat,
                mealDescription: mealDescription,
                timestamp: date.toISOString()
            }, { merge: true });
            console.log("Meal logged successfully!");
            showMessage({
                message: "Meal logged successfully!",
                description: date.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}),
                type: "success",
                duration: 3000,
              });
        } catch (err) {
            console.error("Error logging meal: ", err);
        }
    };
    
      const handleAddToDatabase = (food) => {
        const calories = food.calories; 
        const carbs = food.carbohydrates_total_g;
        const fat = food.fat_total_g;
        const mealDescription = food.name;
        const protein = food.protein_g;
        const servings = 1;
        const sodium = food.sodium_mg;
        const date = new Date();
      
        logMealToDB(mealDescription, calories, servings, protein, sodium, carbs, fat, date);
      };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate('FitnessPlan')}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Food and Recipes</Text>
      </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
          style={styles.searchInput}
          placeholder="Search for foods or recipes"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

      {foodData && (
        <View style={styles.exerciseContainer}>
            {foodData.map((food, index) => (
            <View key={index} style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{food.name.replace(/_/g, ' ')}</Text>
                <Text>Calories: {food.calories}</Text>
                <Text>Carbs: {food.carbohydrates_total_g} g</Text>
                <Text>Fat: {food.fat_total_g} g</Text>
                <Text>Protein: {food.protein_g} g</Text>
                <Text>Sodium: {food.sodium_mg} mg</Text>
                <Text>Serving Size: {food.serving_size_g} g</Text>
                <Text>Sugar: {food.sugar_g} g</Text>

                {/* Add Button */}
                <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => handleAddToDatabase(food)}> 
                <AntDesign name="plus" size={24} color="#FFF" />
                </TouchableOpacity>

                <Button 
                  title="View Recipes" 
                  onPress={() => navigation.navigate('RecipePage', { foodQuery: food.name })} 
                />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
  },
});
