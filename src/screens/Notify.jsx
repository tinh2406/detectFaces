import { useNetInfo } from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import { SafeAreaView, Text, FlatList, TouchableOpacity, View, Button } from "react-native";
import { AuthContext } from "../contexts/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage"

import deepEqual from "deep-equal"
export default function Notify() {
    const { user } = useContext(AuthContext)
    const [notifys, setNotifys] = useState()
    const [numOfCurrent, setNumOfCurrent] = useState(10)
    const [has, setHas] = useState(true)
    const netInfor = useNetInfo()
    useFocusEffect(
        React.useCallback(() => {
            const getNotifysLocal = async () => {
                if(!notifys){
                    setNotifys(JSON.parse(await AsyncStorage.getItem('notifys')))
                }
            }
            getNotifysLocal()
            return () => { getNotifysLocal }
        }, [notifys])
    )
    useFocusEffect(
        React.useCallback(() => {
            const intervalId = setInterval(() => {
                updateNotify();
            }, 3000)
            const updateNotify = async () => {
                if (netInfor.isConnected) {

                    const notis = await getNotifys()
                    if (!deepEqual(notifys,notis)) {
                        await setNotis(notis)
                        if(numOfCurrent==10){
                            await AsyncStorage.setItem('notifys',JSON.stringify(notis))
                        }
                        console.log("reset notifys")
                    }
                }
            }
            return () => { clearInterval(intervalId) }
        }, [netInfor,notifys,numOfCurrent])
    )
    const getNotifys = async () => {
        const userRef = firestore().collection('users').doc(user.phone)
        const addressDoor = (await userRef.get()).data().addressDoor
        const notifysDocs = (await firestore().collection('notifys').where('device', 'in', addressDoor).orderBy("createAt", 'desc').limit(numOfCurrent).get()).docs
        setHas((await firestore().collection('notifys').where('device', 'in', addressDoor).get()).size > numOfCurrent)
        const notis = []
        await Promise.all(notifysDocs.map(async (doc) => {
            const device = (await doc.data().device.get()).data()
            const createAt = await doc.data().createAt.toDate().toString()
            const notify = { createAt, device, message: doc.data().message, id: doc.id }
            if (doc.exists) {
                notis.push(notify)
            }
        }))
        return notis
    }
    const setNotis = async(notis)=>{
        setNotifys(notis)
    }
    return (
        <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
            <Text>
                Notify
            </Text>
            {netInfor.isConnected &&
                <FlatList
                    data={notifys}
                    renderItem={({ item }) => <Item notify={item} />}
                    keyExtractor={item => item.id}
                    item
                >
                </FlatList>}
            {has && <Button onPress={() => {setNumOfCurrent(numOfCurrent + 10) }} title="Load more"></Button>}
        </SafeAreaView>
    )
}


const Item = ({ notify: { message, createAt } }) => {
    const handleLongPress = async () => {

    }
    return (
        <TouchableOpacity onLongPress={handleLongPress}>
            <View style={{ flex: 1, justifyContent: "space-between", flexDirection: "row" }}>
                <Text>{message}</Text>
                <Text>{createAt}</Text>
            </View>
        </TouchableOpacity>

    )
}