// credit: i followed this tutorial https://www.youtube.com/watch?v=IEyUouhcuNQ for the most part

import React from "react";
import { View, StyleSheet, Animated, Pressable } from "react-native";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';


class FloatingButton extends React.Component {
    animation = new Animated.Value(0)

    toggleMenu = () => {
        const toValue = this.open ? 0 : 1

        Animated.spring(this.animation, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start();

        this.open = !this.open;
    }

    render() {
        const waterStyle = {
            transform: [
                { scale: this.animation },
                {
                    translateY: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -80]
                    })
                }
            ]
        }

        const foodStyle = {
            transform: [
                { scale: this.animation },
                {
                    translateY: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -140]
                    })
                }
            ]
        }

        const workoutStyle = {
            transform: [
                { scale: this.animation },
                {
                    translateY: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -200]
                    })
                }
            ]
        }

        const rotation = {
            transform: [
                {
                    rotate: this.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "45deg"]
                    })
                }
            ]
        }

        handleWorkoutAdd = () => {
            console.log("Workout add button pressed");
            this.props.navigation.navigate('AddWorkout');
        }
    
        handleFoodAdd = () => {
            console.log("Food add button pressed");
            this.props.navigation.navigate('AddFood');
        }
    
        handleWaterAdd = () => {
            console.log("Water add button pressed");
            this.props.navigation.navigate('AddWater');
        }

        return (
            <View style={[styles.container, this.props.style]}>
                <Pressable onPress={handleWorkoutAdd}>
                    <Animated.View style={[styles.button, styles.secondary, workoutStyle]}>
                        <FontAwesome6 name="weight-hanging" size={20} color="#2F80ED" />
                    </Animated.View>
                </Pressable>

                <Pressable onPress={handleFoodAdd}>
                    <Animated.View style={[styles.button, styles.secondary, foodStyle]}>
                        <FontAwesome6 name="bowl-food" size={20} color="#2F80ED" />
                    </Animated.View>
                </Pressable>

                <Pressable onPress={handleWaterAdd}>
                    <Animated.View style={[styles.button, styles.secondary, waterStyle]}>
                        <FontAwesome6 name="glass-water" size={20} color="#2F80ED" />
                    </Animated.View>
                </Pressable>

                <Pressable onPress={this.toggleMenu}>
                    <Animated.View style={[styles.button, styles.menu, rotation]}>
                        <AntDesign name="plus" size={24} color="#FFF" />
                    </Animated.View>
                </Pressable>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        position: "absolute"
    },
    button: {
        position: "absolute",
        width: 60,
        height: 60,
        borderRadius: 60 / 2,
        alignItems: "center",
        justifyContent: "center",
        shadowRadius: 10,
        shadowColor: "#2F80ED",
        shadowOpacity: 0.3,
        shadowOffset: { height: 10 },
    },
    menu: {
        backgroundColor: "#2F80ED"
    },
    secondary: {
        width: 48,
        height: 48,
        borderRadius: 48 / 2,
        backgroundColor: "#E4E4E4"
    }
})

export default function (props) {
    const navigation = useNavigation();

    return <FloatingButton {...props} navigation={navigation} />;
}