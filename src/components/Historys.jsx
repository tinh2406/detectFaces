import { useNetInfo } from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import { SafeAreaView, Text, FlatList, TouchableOpacity, View, Button } from "react-native";
import { AuthContext } from "../contexts/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage"
import deepEqual from "deep-equal"


export default function Historys() {
    const {addressDoorRef } = useContext(AuthContext)
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
            if (addressDoorRef) {
                const historysRef = firestore().collection('historys').where('device', 'in', addressDoorRef).orderBy("createAt", 'desc').limit(numOfCurrent);
                const unsubscribe = historysRef.onSnapshot(
                    async (snapshot) => {
                        setHas((await firestore().collection('historys').where('device', 'in', addressDoorRef).get()).size > numOfCurrent);
                        const hists = [];
                        await Promise.all(snapshot.docs.map(async (doc) => {
                            const device = (await doc.data().device.get()).data();
                            const createAt = await doc.data().createAt.toDate().toString();
                            const history = { createAt, device, message: doc.data().message, id: doc.id };
                            if (doc.exists) {
                                hists.push(history);
                            }
                        }));
                        console.log(deepEqual(historys, hists));
                        if (!deepEqual(historys, hists)) {
                            setHistorys(hists);
                            if (numOfCurrent == 10) {
                                await AsyncStorage.setItem('historys', JSON.stringify(hists));
                            }
                            console.log("reset historys");
                        }
                    }
                )
                return () => {
                    unsubscribe()
                };
            }
        }, [netInfor, historys, numOfCurrent, addressDoorRef])
    );
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