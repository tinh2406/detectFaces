import { Image, SafeAreaView, Text, View } from "react-native"
import storage from "@react-native-firebase/storage";
import firestore from '@react-native-firebase/firestore'
import { useFocusEffect } from "@react-navigation/native"
import React, { useState } from "react"
import { FormatNotify } from "../utils/updateNotify"
import deepEqual from "deep-equal"
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function  Notify({navigation,route}) {
    const [url,setUrl] = useState()
    const [notify,setNotify]=useState()
    useFocusEffect(
        React.useCallback(()=>{
            const fetch = async()=>{
                const notifys = JSON.parse(await AsyncStorage.getItem('notifys'))
                var newNotify = notifys.find(notify=>notify.id==route.params.id)
                if(!newNotify){
                const doc = (await firestore().collection('notifys').doc(route.params.id).get())
                newNotify = await FormatNotify(doc)
                }
                if(!deepEqual(notify,newNotify)){
                    setNotify(newNotify)
                }
                if(notify && notify.imgPath){
                    if(notify.imgPath.includes('appspot.com/'))
                    setUrl(await storage().ref(notify.imgPath.split('appspot.com/')[1]).getDownloadURL())
                    console.log(url)
                }
            }
            fetch()
            return ()=>{fetch}
        },[notify,url]
    )
    )
    return(
        <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
            {notify&&<>
            <Text>{notify.message}</Text>
            <View style={{flexDirection:'row'}}>
            <Text>{notify.device.name}</Text>
            <Text>{notify.device.addressDoor}</Text>
            </View>
            <Text>{notify.createAt}</Text>
            {url&&<Image src={url} resizeMode="center" style={{width:'100%',height:300}}></Image>}
            </>}
        </SafeAreaView>

    )
}