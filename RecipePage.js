import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_KEY } from '@env';

export default function RecipePage ({ route }) {
  const navigation = useNavigation();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipe = async (query) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.api-ninjas.com/v1/recipe?query=${query}`, {
        headers: { 'X-Api-Key': API_KEY },
      });

      if (!response.ok) {
        throw new Error('Something went wrong fetching the recipe');
      }

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.foodQuery) {
      fetchRecipe(route.params.foodQuery);
    }
  }, [route.params]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>{route.params?.foodQuery.charAt(0).toUpperCase() + route.params?.foodQuery.slice(1)} Recipes</Text>
      </View>

      {loading && <Text>Loading recipes...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}

      {recipes.map((recipe, index) => (
      <View style={styles.exerciseContainer}>
        <View style={styles.exerciseCard} key={index}> 
          <Text style={styles.exerciseName}>{recipe.title}</Text>

          <Text style={styles.sectionHeader}>Ingredients:</Text> 
          <FlatList 
            data={recipe.ingredients.split('|')}
            keyExtractor={(ingredient, ingredientIndex) => ingredientIndex.toString()}
            renderItem={({ item }) => (
              <Text style={styles.ingredientItem}>{item.trim()}</Text>
            )}
          />

          <Text style={styles.sectionHeader}>Servings:</Text>
          <Text style={styles.servingInfo}>{recipe.servings}</Text>

          <Text style={styles.sectionHeader}>Instructions:</Text> 
          <Text style={styles.instructions}>{recipe.instructions}</Text> 
        </View>
      </View>
      ))}
    </ScrollView>
  );
};

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
    sectionHeader: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5, 
    },
  });
  