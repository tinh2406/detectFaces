import {useState} from 'react'
import { SafeAreaView, Text,View,StyleSheet, TextInput, Button } from "react-native"
import Faces from '../components/Faces'


export default function AddFace({navigation,route}){
    const [name,setName] = useState("")
    if(route?.params?.message==="add face successfully") {
        setName("")
        route.params = {}
        console.log(route)}
    
    const handleAddFace = ()=>{
        if(name==="")
        return
        navigation.navigate('GetFace',{name})
    }
    return(
        <SafeAreaView style={{backgroundColor:"black"}}>
            <View>
                <Text>Name:</Text>
                <TextInput
                    value={name}
                    onChangeText={text=>setName(text)}
                />
            </View>
            <Button
            title='Thêm'
            onPress={handleAddFace}/>
            <Faces/>
        </SafeAreaView>
    )
}