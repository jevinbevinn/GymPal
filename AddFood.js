import React , { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ImageBackground, ScrollView, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AlertModel from './AlertModel';
import { setDoc, doc, getDoc } from 'firebase/firestore/lite';
import { auth, db } from './firebase';
import { showMessage } from 'react-native-flash-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { API_KEY } from '@env';

export default function LogMeals() {
  const navigation = useNavigation();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [mealDescription, setMealDescription] = useState('');
  const [servingAmount, setServingAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const isEmptyField = () => {
    return !mealDescription || !date || !servingAmount;
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
            servings: servingAmount,
            protein: protein,
            sodium: sodium,
            carbs: carbs,
            fat: fat,
            mealDescription: mealDescription,
            timestamp: date.toISOString()
        }, { merge: true });
        console.log("Meal logged successfully!");
    } catch (err) {
        console.error("Error logging meal: ", err);
    }
};


  const handlePress = () => {
    if (isEmptyField()) {
      setAlertMessage('Please fill in all fields.');
      setShowAlert(true);
    } else {
      fetch(`https://api.api-ninjas.com/v1/nutrition?query=${mealDescription}`, {
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
          console.log(data[0]);

          let servings = Number(servingAmount);
          
          const mealName = data[0]['name'];
          const calories = data[0]['calories'] * servings;
          const protein = data[0]['protein_g'] * servings;
          const sodium = data[0]['sodium_mg'] * servings;
          const carbs = data[0]['carbohydrates_total_g'] * servings;
          const fat = data[0]['fat_total_g'] * servings;

          console.log('Logging meal with date:', date);
          logMealToDB(mealName, calories, servings, protein, sodium, carbs, fat, date);
        })
        .catch(error => {
          console.error('Request failed:', error);
        });

      showMessage({
        message: "Meal logged successfully!",
        description: date.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'}),
        type: "success",
        duration: 3000,
      });
      navigation.goBack(); // or navigate to a specific screen
    }
  };

  function handleDateChange(ev) {
    if (!ev.target['validity'].valid) return;
    const dt = ev.target['value'] + ':00Z';
    setDate(new Date(dt));
  }

  function formatDate() {
    if (!(date instanceof Date)) {
      return null;
    }
  
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}`; 
  }

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
  };
  

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatePicker = () => {
    showMode('date');
  };

  const showTimePicker = () => {
    showMode('time');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Log a Meal</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Meal Description</Text>
        <TextInput
          style={styles.input}
          value={mealDescription}
          onChangeText={setMealDescription}
          placeholder="What did you eat?"
        />

        <Text style={styles.label}>Servings</Text>
        <TextInput
          style={styles.input}
          value={servingAmount}
          onChangeText={setServingAmount}
          placeholder="How many servings did you eat?"
        />

      <Text style={styles.label}>Date</Text>
        {Platform.OS === 'web' ? (
            <input
            type="datetime-local"
            style={styles.input}
            defaultValue={formatDate()}
            onChange={handleDateChange}
            ></input>
        ) : (
            <View>
            <Pressable style={styles.button} onPress={showDatePicker}>
            <Text style={styles.buttonText}>Set Date</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={showTimePicker}>
            <Text style={styles.buttonText}>Set Time</Text>
            </Pressable>
            <Text>selected: {date.toLocaleTimeString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</Text>
            {show && (
                <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                is24Hour={true}
                onChange={onChange}
                />
            )}
            </View>
        )}
      </View>

      <View style={styles.createButtonContainer}>
        <Pressable onPress={handlePress}>
          <ImageBackground source={require('./assets/button.png')} style={styles.createButton} resizeMode="contain">
            <Text style={styles.createButtonText}>Submit</Text>
          </ImageBackground>
        </Pressable>
      </View>
      <AlertModel visible={showAlert} message={alertMessage} onClose={() => setShowAlert(false)} />
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
});
