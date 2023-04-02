import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo } from '@react-native-community/netinfo';
import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import deepEqual from 'deep-equal';
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import { AuthContext } from '../contexts/authContext';
import AddFace from "../screens/AddFace";
import Home from "../screens/Home";
import Login from "../screens/Login";
import Notifys from "../screens/Notifys";
import OpenDoor from "../screens/OpenDoor";
import User from "../screens/User";
const Tab = createBottomTabNavigator();

export default function TabNavigator({ route }) {
    const { user } = useContext(AuthContext)
    console.log(route)

    useFocusEffect(
        React.useCallback(() => {
            const unsub = async () => {
                console.log(user, "user")
                if (user) {
                    await messaging().registerDeviceForRemoteMessages();
                    const token = await messaging().getToken();
                    try {
                        await firestore().collection('tokens').doc(user.phone).update({
                            devices: firestore.FieldValue.arrayUnion(token)
                        })
                    } catch (error) {
                        await firestore().collection('tokens').doc(user.phone).set({
                            devices: [token]
                        }, { merge: true });
                    }
                    console.log(token)
                }
            }
            unsub()
            return () => { unsub }
        }, [user])
    )

    if (!user)
        return <Login />

    return (
        <Tab.Navigator >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="AddFace" initialParams={route?.params?.screen === "AddFace" ? { message: route.params.message } : ""} component={AddFace} />
            <Tab.Screen name="OpenDoor" component={OpenDoor} />
            <Tab.Screen name="Notifys" component={Notifys} />
            <Tab.Screen name="User" component={User} />
        </Tab.Navigator>
    );
}

