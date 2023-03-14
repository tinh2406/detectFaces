import { async } from "@firebase/util";
import axios from "axios";
import { useContext, useState } from "react";
import { Button, Text, TextInput, ToastAndroid, View } from "react-native";
import { AuthContext } from "../contexts/authContext";

export default function AddUser({setAddUser}){
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
            const res = await axios.post("http://192.168.43.98:3000/users/addUser",{phone,name,phoneOwner:user.phone})
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
            const res = await axios.post("http://192.168.43.98:3000/users/addUserExists",{phone,name,phoneOwner:user.phone,verification})
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
            await axios.post("http://192.168.43.98:3000/users/resendVerifyCode",{phone})
        } catch (error) {
            console.log(error)
        }
    }
    return(
        <View>
            <TextInput value={phone} onChangeText={text=>setPhone(text)} placeholder="Phone number" style={{padding:10,marginVertical:5}}/>
            <TextInput value={name} onChangeText={text=>setName(text)} placeholder="Name users" style={{padding:10,marginVertical:5}}/>
            {openVerify&&<TextInput value={verification} onChangeText={text=>setVerification(text)} placeholder="Verification code" style={{padding:10,marginVertical:5}}/>}
            <Button color={(name&&phone&&phone!==user.phone&&phone.trim().length===10)?"green":"gray"} title="Add users" onPress={handleCreateUser}/>
            {wrongVerifyCode&&<Text style={{fontSize:14,color:"blue"}} onPress={handleResendVerifyCode}>Resend verification code</Text>}
        </View>
    )
}