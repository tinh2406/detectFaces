import { useContext, useState, } from "react";
import { Button, Text, TextInput, ToastAndroid, View } from "react-native";
import axios from "axios"
import { AuthContext } from "../contexts/authContext";
export default function UpdatePassword({setUpdatePassword}){
    const {user} = useContext(AuthContext)
    const [oldPassword,setOldPassword] = useState("")
    const [newPassword,setNewPassword] = useState("")
    const [reNewPassword,setReNewPassword] = useState("")
    const handleUpdatePassword = async()=>{
        if(newPassword!==reNewPassword)
        return
        if(!oldPassword || !newPassword)
        return
        try {
            const res = await axios.post("http://192.168.43.98:3000/users/updatePassword",{phone:user.phone,password:oldPassword,newPassword})
            ToastAndroid.show(res.data.message,ToastAndroid.SHORT)
            setUpdatePassword(false)
        } catch (error) {
            ToastAndroid.show("Password unchanged",ToastAndroid.SHORT)
        }
    }

    return(
        <View >
            <TextInput value={oldPassword} onChangeText={text=>setOldPassword(text)} placeholder="Old password" style={{padding:10,marginVertical:5}}/>
            <TextInput value={newPassword} onChangeText={text=>setNewPassword(text)} placeholder="New password" style={{padding:10,marginVertical:5}}/>
            <TextInput value={reNewPassword} onChangeText={text=>setReNewPassword(text)} placeholder="Confirm new password" style={{padding:10,marginVertical:5}}/>
            {(newPassword!==reNewPassword && reNewPassword) && <Text style={{fontSize:12,color:"red"}}>New password and confirm password fields do not match</Text>}
            <Button color={(oldPassword&&newPassword&&reNewPassword&&newPassword===reNewPassword)?"green":"gray"} title="Update" onPress={handleUpdatePassword}/>
        </View>
    )
}