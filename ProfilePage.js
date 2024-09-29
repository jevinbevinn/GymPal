import { React, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from './firebase';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

export default function ProfilePage() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.userInfoSection}>
        <Ionicons name="person-circle-outline" size={80} color="#4F8EF7" />
        <Text style={styles.userName}>{auth.currentUser?.displayName || "No name available"}</Text>
        <Text style={styles.userEmail}>{auth.currentUser?.email || "No email available"}</Text>
      </View>

      <Pressable style={styles.signOutButton} onPress={() => auth.signOut().then(function() {
                  console.log("signed out");
               })
               .catch(function(error) {
                  console.error(error);
               })}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', 
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 100, 
  },
  backButton: {
    marginRight: 10,
    marginBottom: 5,
  },
  backButtonText: {
    fontFamily: 'Poppins',
    fontSize: 25,
    marginTop: 6,
    fontWeight: '700',
    color: '#000',
  },
  title: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginLeft: 1,
  },
  userInfoSection: {
    alignItems: 'center',
    marginTop: 120, 
  },
  userName: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
  },
  userEmail: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#707070',
    marginTop: 4,
  },
  signOutButton: {
    marginTop: 30,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 5,
  },
  signOutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
});
