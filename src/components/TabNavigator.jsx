import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from "../screens/Home";
import AddFace from "../screens/AddFace";
import OpenDoor from "../screens/OpenDoor";
import Notify from "../screens/Notify";
import User from "../screens/User";
import AsyncStorage from "@react-native-async-storage/async-storage"
import Login from "../screens/Login";

import { useContext, useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import { AuthContext } from '../contexts/authContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ route }) {
    const [loading, setLoading] = useState(true)
    const { user, setUser } = useContext(AuthContext)
    console.log(route)
    useEffect(() => {
        const checkLogin = async () => {
            console.log(user, "home.jsx")
            setUser(JSON.parse(await AsyncStorage.getItem('user')))
            setLoading(false)

            return
        }
        checkLogin()
    }, [])
    if (loading)
        return <SafeAreaView>
            <Text>Loading...</Text>
        </SafeAreaView>
    if (!user)
        return <Login />
    return (
        <Tab.Navigator >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="AddFace" initialParams={route?.params?.screen === "AddFace" ? { message: route.params.message } : ""} component={AddFace} />
            <Tab.Screen name="OpenDoor" component={OpenDoor} />
            <Tab.Screen name="Notify" component={Notify} />
            <Tab.Screen name="User" component={User} />
        </Tab.Navigator>
    );
}

