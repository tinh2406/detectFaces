import React, { useContext } from "react";
import { FlatList, SafeAreaView, Text, TouchableOpacity, View,Alert } from "react-native";
import { AuthContext } from "../contexts/authContext";
import { useNetInfo } from '@react-native-community/netinfo';
import deepEqual from 'deep-equal';
import { useFocusEffect } from "@react-navigation/native";
import firestore from "@react-native-firebase/firestore";
export default function OpenDoor(){
    const {user,setUser} = useContext(AuthContext)
    const netInfor = useNetInfo()
    useFocusEffect(
        React.useCallback(()=>{
            const intervalId = setInterval(()=>{
                updateUser();
            },1000)
            const updateUser = async()=>{
                if(netInfor.isConnected){
                    const data = (await firestore().collection('users').doc(user.phone).get()).data()
                    const address = []
                    await Promise.all(data.addressDoor.map(async (device) => {
                        const res = await device.get()
                        if (res.exists) {
                            address.push(res.data())
                        }
                    }))
                    data.addressDoor = address
                    if(!deepEqual(data.addressDoor,user.addressDoor)){
                        setUser({...data,phone:user.phone})
                        console.log(data.addressDoor,user.addressDoor)
                    }
                }
            }
            return ()=>{clearInterval(intervalId)}
        },[netInfor])
    )
    return(
        <SafeAreaView style={{backgroundColor:"black",flex:1}}>
            <Text>
                OpenDoor
            </Text>
            <Text>
                Devices
            </Text>
            {netInfor.isConnected&&
            <FlatList
                data={user.addressDoor}
                renderItem={({item})=><Item address={item}/>}
                keyExtractor={item=>item.addressDoor}
                item
            >
            </FlatList>}
        </SafeAreaView>
    )
}


const Item = ({address:{addressDoor,name}})=>{
    const handleLongPress = async()=>{
        Alert.alert('Mở cửa',addressDoor, [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel',
            },
            {text: 'OK', onPress: () => {}},
          ]);
    }
    return(
        <TouchableOpacity onLongPress={handleLongPress}>
            <View style={{flex:1,justifyContent:"space-between",flexDirection:"row"}}>
                <Text>{addressDoor}</Text>
                <Text>{name}</Text>
            </View>
        </TouchableOpacity>
        
    )
}