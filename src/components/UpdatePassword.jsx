import { API_URL } from "@env"
import { useContext, useState } from "react";
import { Button, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import axios from "axios"
import { AuthContext } from "../contexts/authContext";
export default function UpdatePassword({ setUpdatePassword }) {
    // console.log(API_URL)
    const { user } = useContext(AuthContext)
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [reNewPassword, setReNewPassword] = useState("")
    const handleUpdatePassword = async () => {
        if (newPassword !== reNewPassword)
            return
        if (!oldPassword || !newPassword)
            return
        try {
            const res = await axios.post(`${API_URL}:3000/users/updatePassword`, { phone: user.phone, password: oldPassword, newPassword })
            ToastAndroid.show(res.data.message, ToastAndroid.SHORT)
            setUpdatePassword(false)
        } catch (error) {
            ToastAndroid.show("Password unchanged", ToastAndroid.SHORT)
        }
    }

    return (
        <View style={{marginBottom:16}}>
            <TextInput style={styles.textInput} value={oldPassword} onChangeText={text => setOldPassword(text)} placeholder="Old password" />
            <TextInput style={styles.textInput} value={newPassword} onChangeText={text => setNewPassword(text)} placeholder="New password" />
            <TextInput style={styles.textInput} value={reNewPassword} onChangeText={text => setReNewPassword(text)} placeholder="Confirm new password" />
            {(newPassword !== reNewPassword && reNewPassword) && <Text style={{ fontSize: 12, color: "red" }}>New password and confirm password fields do not match</Text>}
            <Button color={(oldPassword && newPassword && reNewPassword && newPassword === reNewPassword) ? "green" : "gray"} title="Update" onPress={handleUpdatePassword} />
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