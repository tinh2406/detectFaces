import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from "../screens/Home";
import AddFace from "../screens/AddFace";
import OpenDoor from "../screens/OpenDoor";
import Notify from "../screens/Notify";
import User from "../screens/User";
import AsyncStorage from "@react-native-async-storage/async-storage"
import Login from "../screens/Login";
import firestore from "@react-native-firebase/firestore";
import deepEqual from 'deep-equal';
import { useContext, useEffect, useState } from "react";
import { SafeAreaView, Text, useAnimatedValue } from "react-native";
import { AuthContext } from '../contexts/authContext';
import { useNetInfo } from '@react-native-community/netinfo';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ route }) {
    const {isConnected} = useNetInfo()
    const [loading, setLoading] = useState(true)
    const { user, setUser } = useContext(AuthContext)
    console.log(route)
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const _user = await AsyncStorage.getItem('user')
                if(_user!=JSON.stringify(user)){
                    await setUser(JSON.parse(_user))
                }
                setLoading(false)
                if(user && isConnected){
                    const data = (await firestore().collection('users').doc(user.phone).get()).data()
                    const address = []
                    await Promise.all(data.addressDoor.map(async (device) => {
                        const res = await device.get()
                        if (res.exists) {
                            address.push(res.data())
                        }
                    }))
                    data.addressDoor = address
                    await AsyncStorage.setItem('user',JSON.stringify({...data,phone:user.phone}))
                    if(!deepEqual({...data,phone:user.phone},user)){
                        await setUser({...data,phone:user.phone})
                    }
                }
                return
            } catch (error) {
                console.log(error)
            }
        }
            
        checkLogin()
    }, [user,isConnected])
   
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

