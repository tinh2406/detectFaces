import { useNetInfo } from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import { SafeAreaView, Text, FlatList, TouchableOpacity, View, Button, Image } from "react-native";
import { AuthContext } from "../contexts/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage"

import deepEqual from "deep-equal"
import FormatDate from "../utils/formatDate";
import { FormatNotify } from "../utils/updateNotify";
export default function Notifys({navigation}) {
    const { user,addressDoorRef } = useContext(AuthContext)
    const [notifys, setNotifys] = useState()
    const [numOfCurrent, setNumOfCurrent] = useState(10)
    const [has, setHas] = useState(true)
    const netInfor = useNetInfo()
    useFocusEffect(
        React.useCallback(() => {
            const getNotifysLocal = async () => {
                const notifysLocal = JSON.parse(await AsyncStorage.getItem('notifys'))
                if (!notifys || (notifys && notifys[0].createAt < notifysLocal[0].createAt)) {
                    setNotifys(notifysLocal)
                }
            }
            getNotifysLocal()
            return () => { getNotifysLocal }
        }, [notifys])
    )

    useFocusEffect(
        React.useCallback(() => {
            if (addressDoorRef) {
                const notifysRef = firestore().collection('notifys').where('device', 'in', addressDoorRef).orderBy("createAt", 'desc').limit(numOfCurrent);
                const unsubscribe = notifysRef.onSnapshot(
                    async (snapshot) => {
                        setHas((await firestore().collection('notifys').where('device', 'in', addressDoorRef).get()).size > numOfCurrent);
                        const notis = [];
                        await Promise.all(snapshot.docs.map(async (doc) => {
                            if (doc.exists) {
                                notis.push(await FormatNotify(doc));
                            }
                        }));
                        console.log(deepEqual(notifys, notis));
                        if (!deepEqual(notifys, notis)) {
                            setNotifys(notis);
                            if (numOfCurrent == 10) {
                                await AsyncStorage.setItem('notifys', JSON.stringify(notis));
                            }
                            console.log("reset notifys");
                        }
                    }
                )
                return () => {
                    unsubscribe()
                };
            }
        }, [netInfor, notifys, numOfCurrent, addressDoorRef])
    );
    return (
        <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
            <Text>
                Notify
            </Text>
            {netInfor.isConnected &&
                <FlatList
                    data={notifys}
                    renderItem={({ item }) => <Item notify={item} navigation={navigation} />}
                    keyExtractor={item => item.id}
                    item
                >
                </FlatList>}
            {has && <Button onPress={() => { setNumOfCurrent(numOfCurrent + 10) }} title="Load more"></Button>}
        </SafeAreaView>
    )
}


const Item = ({ notify: { message, createAt,imgPath,id },navigation }) => {
    const createAtFormat = FormatDate(createAt)
    const [url,setUrl] = useState()
    useFocusEffect(
        React.useCallback(()=>{
            const getUrl=async()=>{
                if(imgPath){
                    if(imgPath.includes('appspot.com/'))
                    imgPath = imgPath.split('appspot.com/')[1]
                    setUrl(await storage().ref(imgPath).getDownloadURL())
                }
            }
            getUrl()
            return getUrl
        },[imgPath])
    )
    const handleLongPress = async () => {

    }
    const handlePress = ()=>{
        navigation.navigate('Notify',{id})
    }
    return (
        <TouchableOpacity onLongPress={handleLongPress} onPress={handlePress}>
            <View style={{ flex: 1, justifyContent: "space-between", flexDirection: "row" }}>
                <View style={{ flex: 1, justifyContent: "space-between", flexDirection: "column" }}>
                <Text>{message}</Text>
                <Text style={{fontSize:10}}>{createAtFormat}</Text>
                </View>
                {url&&<Image src={url} style={{width:40}}></Image>}
            </View>
        </TouchableOpacity>

    )
}