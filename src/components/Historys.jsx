import { useNetInfo } from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import { SafeAreaView, Text, FlatList, TouchableOpacity, View, Button } from "react-native";
import { AuthContext } from "../contexts/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage"
import deepEqual from "deep-equal"


export default function Historys() {
    const { user } = useContext(AuthContext)
    const [historys, setHistorys] = useState()
    const [numOfCurrent, setNumOfCurrent] = useState(10)
    const [has, setHas] = useState(true)
    const netInfor = useNetInfo()
    useFocusEffect(
        React.useCallback(() => {
            const getHistorysLocal = async () => {
                if(!historys){
                    setHistorys(JSON.parse(await AsyncStorage.getItem('historys')))
                }
            }
            getHistorysLocal()
            return () => { getHistorysLocal }
        }, [historys])
    )
    useFocusEffect(
        React.useCallback(() => {
            const intervalId = setInterval(() => {
                updateHistory();
            }, 3000)
            const updateHistory = async () => {
                if (netInfor.isConnected) {

                    const hists = await getHistorys()
                    if (!deepEqual(historys,hists)) {
                        await setHists(hists)
                        if(numOfCurrent==10){
                            await AsyncStorage.setItem('historys',JSON.stringify(hists))
                        }
                        console.log("reset historys")
                    }
                }
            }
            return () => { clearInterval(intervalId) }
        }, [netInfor,historys,numOfCurrent])
    )
    const getHistorys = async () => {
        const userRef = firestore().collection('users').doc(user.phone)
        const addressDoor = (await userRef.get()).data().addressDoor
        const historysDocs = (await firestore().collection('historys').where('device', 'in', addressDoor).orderBy("createAt", 'desc').limit(numOfCurrent).get()).docs
        setHas((await firestore().collection('historys').where('device', 'in', addressDoor).get()).size > numOfCurrent)
        const hists = []
        await Promise.all(historysDocs.map(async (doc) => {
            const device = (await doc.data().device.get()).data()
            const createAt = await doc.data().createAt.toDate().toString()
            const history = { createAt, device, message: doc.data().message, id: doc.id }
            if (doc.exists) {
                hists.push(history)
            }
        }))
        return hists
    }
    const setHists = async(hists)=>{
        setHistorys(hists)
    }
    return (
        <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
            <Text>
                Historys
            </Text>
            {netInfor.isConnected &&
                <FlatList
                    data={historys}
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