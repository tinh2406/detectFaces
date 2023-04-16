import {API_URL} from "@env"
import axios from "axios";
import { useContext, useState } from "react";
import { Button, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import { AuthContext } from "../contexts/authContext";

export default function AddUser({setAddUser}){
    // console.log(API_URL)
    const [phone,setPhone]=useState("")
    const [name,setName]=useState("")
    const [verification,setVerification]=useState("")
    const [openVerify,setOnpenVerify]=useState(false)
    const {user} = useContext(AuthContext)
    const [wrongVerifyCode,setWrongVerify]=useState(false)
    const handleCreateUser = async()=>{
        if(!name) return
        if(phone.trim().length!==10 || phone===user.phone) return
        if(!openVerify){
            const res = await axios.post(`${API_URL}:3000/users/addUser`,{phone,name,phoneOwner:user.phone})
            if(res.data.message==="exists account"){
                setOnpenVerify(true)
                return
            }
            if(res.data.message==="Add account successfully"){
                ToastAndroid.show(res.data.message,ToastAndroid.SHORT)
                setAddUser(false)
            }
        console.log(res.data)
        return
        }
        else{
            const res = await axios.post(`${API_URL}:3000/users/addUserExists`,{phone,name,phoneOwner:user.phone,verification})
            if(res.data.message==="verification code not match")
                setWrongVerify(true)
            if(res.data.message==="Add account successfully"){
                ToastAndroid.show(res.data.message,ToastAndroid.SHORT)
                setAddUser(false)
            }else return
        }
        
    }
    const handleResendVerifyCode = async()=>{
        try {
            await axios.post(`${API_URL}:3000/users/resendVerifyCode`,{phone})
        } catch (error) {
            console.log(error)
        }
    }
    return(
        <View style={{marginBottom:16}}>
            <TextInput style={styles.textInput} value={phone} onChangeText={text=>setPhone(text)} placeholder="Phone number"/>
            <TextInput style={styles.textInput} value={name} onChangeText={text=>setName(text)} placeholder="Name users"/>
            {openVerify&&<TextInput style={styles.textInput} value={verification} onChangeText={text=>setVerification(text)} placeholder="Verification code"/>}
            <Button color={(name&&phone&&phone!==user.phone&&phone.trim().length===10)?"green":"gray"} title="Add users" onPress={handleCreateUser}/>
            {wrongVerifyCode&&<Text style={{fontSize:14,color:"blue"}} onPress={handleResendVerifyCode}>Resend verification code</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    textInput: {
        backgroundColor: "#606060",
        marginBottom:12,
        marginHorizontal:24,
        padding: 12,
        borderRadius: 10,
        fontSize:16,
    }
})