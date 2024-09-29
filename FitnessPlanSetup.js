import React , { useState } from 'react';
import { View,   Platform, KeyboardAvoidingView, Text, TextInput, StyleSheet, Pressable, ImageBackground, ScrollView, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AlertModel from './AlertModel';
import { Picker } from '@react-native-picker/picker';
import { setDoc, doc } from 'firebase/firestore/lite';
import { auth, db } from './firebase';
import { showMessage, hideMessage } from 'react-native-flash-message';

export default function FitnessPlanSetup() {
  const navigation = useNavigation();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [activityLevel, setActivityLevel] = useState('1-2 times a week');

  const isEmptyField = () => {
    return !age || !gender || !weight || !height || !experienceLevel || !activityLevel;
  };

  const addFitnessPlanToDB = async (age, gender, weight, height, experienceLevel, activityLevel) => {
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        age: age,
        gender: gender,
        weight: weight,
        height: height,
        experienceLevel: experienceLevel,
        activityLevel: activityLevel,
        fitnessPlanSetup: true,
      }, { merge: true });
    } catch (err) {
      console.log(err);
    }
  }

  const handlePress = () => {
    console.log('create plan button pressed');
    if (isEmptyField()) {
      console.log('one or more fields is empty');
      setAlertMessage('Please fill in all fields.');
      setShowAlert(true);
    } else {
      console.log('all fields filled');
      // TODO: save the plan set up
      addFitnessPlanToDB(age, gender, weight, height, experienceLevel, activityLevel);
      showMessage({
        message: "You created a fitness plan!",
        description: "Press the 'start' button again to view/modify it!",
        type: "success",
        duration: 3000,
      });
      navigation.navigate('SecondScreen'); // navigate to the fitness plan
    }
  };

  const levels = ['Beginner', 'Intermediate', 'Expert'];
  const activityLevels = ['1-2 times a week', '2-3 times per week', '3-4 times per week', '4-5 times per week', '5-6 times per week'];
  
  //fixed glitch of create plan being not visible using keyboardavoidingview and styling
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}> 
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 60, paddingBottom: 100 }}> 
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate('SecondScreen')}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Fitness Plan</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          inputMode="numeric"
          value={age}
          onChangeText={text => setAge(text)}
        />

        <Text style={styles.label}>Gender</Text>
        <TextInput
          style={styles.input}
          value={gender}
          onChangeText={text => setGender(text)}
        />

        <Text style={styles.label}>Weight(kg)</Text>
        <TextInput
          style={styles.input}
          inputMode="numeric"
          value={weight}
          onChangeText={text => setWeight(text)}
        />

        <Text style={styles.label}>Height(cm)</Text>
        <TextInput
          style={styles.input}
          inputMode="numeric"
          value={height}
          onChangeText={text => setHeight(text)}
        />

        <Text style={styles.label}>Level of Experience</Text>
        <View style={[styles.input, { padding:0 }]}>
          <Picker
            selectedValue={experienceLevel}
            onValueChange={(itemValue) => setExperienceLevel(itemValue)}
          >
            {levels.map((level) => (
              <Picker.Item label={level} value={level} key={level} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Activity Level</Text>
        <View style={[styles.input, { padding:0 }]}>
          <Picker
            selectedValue={activityLevel}
            onValueChange={(itemValue) => setActivityLevel(itemValue)}
          >
            {activityLevels.map((level) => (
              <Picker.Item label={level} value={level} key={level} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.createButtonContainer}>
        <Pressable onPress={handlePress}>
          <ImageBackground source={require('./assets/button.png')} style={styles.createButton} resizeMode="contain">
            <Text style={styles.createButtonText}>Create Plan</Text>
          </ImageBackground>
        </Pressable>
      </View>

      <View style={styles.hintTextContainer}>
        <Text style={styles.hintText}>NOTE: You can always change this later!</Text>
      </View>

      <AlertModel visible={showAlert} message={alertMessage} onClose={() => setShowAlert(false)} />
    </ScrollView>
    </KeyboardAvoidingView>
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
  hintTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  hintText: {
    fontFamily: 'Poppins',
  },
});
