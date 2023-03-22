import React, { useContext } from "react";
import { FlatList, SafeAreaView, Text, TouchableOpacity, View,Alert } from "react-native";
import { AuthContext } from "../contexts/authContext";
import { useNetInfo } from '@react-native-community/netinfo';
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
                    const res = await firestore().collection('users').doc(user.phone).get()
                    if(res.data().addressDoor.toString()!==user.addressDoor.toString()){
                        setUser({...res.data(),phone:user.phone})
                        console.log('update user')
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
            <FlatList
                data={user.addressDoor}
                renderItem={({item})=><Item address={item}/>}
                keyExtractor={item=>item}
                item
            >
            </FlatList>
        </SafeAreaView>
    )
}


const Item = ({address})=>{
    
    const handleLongPress = async()=>{
        Alert.alert('Mở cửa',address, [
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
            <View style={{flex:1}}>
                <Text>{address}</Text>
            </View>
        </TouchableOpacity>
        
    )
}