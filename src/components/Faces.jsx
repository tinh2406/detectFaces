import {API_URL} from "@env"
import { useFocusEffect } from "@react-navigation/native"
import axios from "axios"
import React, { useContext, useState } from "react"
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native"
import { AuthContext } from "../contexts/authContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
export default function Faces(){
    const [registeredFaces,setRegisteredFaces] = useState([])
    const {user} = useContext(AuthContext)
    useFocusEffect(
        React.useCallback(()=>{
            const getFacesLocal = async()=>{
                if(!registeredFaces){
                    setRegisteredFaces(JSON.parse(await AsyncStorage.getItem('faces')))
                }
            }
            getFacesLocal()
            return ()=>{getFacesLocal}
        },[])
    )
    useFocusEffect(
        React.useCallback(()=>{
            console.log("use effect loop")
            const fetch = async()=>{
                try {
                    const {data:{data}} = await axios.get(`${API_URL}:3000/faces/${user.phone}`)
                    if(data!=registeredFaces){
                        setRegisteredFaces(data)
                        await AsyncStorage.setItem('faces',JSON.stringify(data))
                    }
                    } catch (error) {
                        console.log(error.message)
                    }
                }
            const intervalId = setInterval(()=>{
                fetch();
            },1000)
            return ()=>{clearInterval(intervalId)}
        },[registeredFaces])
    )
    return(
        <View>
            <Text>Registered faces</Text>
            <FlatList
                data={registeredFaces}
                renderItem={({item})=><Item face={item}/>}
                keyExtractor={item=>item.id}
                item
            >
            </FlatList>
        </View>
    )
}

const Item = ({face:{name,id}})=>{
    const handleDelete = async()=>{
        try {
            const res =await axios.delete(`${API_URL}:3000/faces/${id}`)
            console.log(res)
        } catch (error) {
            console.log(error.message)
        }
    }
    const handleLongPress = async()=>{
        Alert.alert('Bạn có chắc xóa không',name, [
            {
              text: 'Cancel',
              onPress: () => {},
              style: 'cancel',
            },
            {text: 'OK', onPress: () => {handleDelete()}},
          ]);
    }
    return(
        <TouchableOpacity onLongPress={handleLongPress}>
            <View style={{flex:1}}>
                <Text>{name}</Text>
            </View>
        </TouchableOpacity>
        
    )
}