import { useState, useContext } from "react";
import { Button, SafeAreaView, Text, TextInput, ToastAndroid } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import firestore from "@react-native-firebase/firestore"
import { AuthContext } from "../contexts/authContext";
export default function Login() {
    const context = useContext(AuthContext)

    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {
        const res = await firestore().collection('users').doc(phone).get()
        if (!res.exists) {
            ToastAndroid.show('Wrong phone number', ToastAndroid.SHORT);
            return
        }
        const user = res.data()
        if (password === user.password) {
            await AsyncStorage.setItem("user", JSON.stringify({ ...user, phone }))
            console.log(await AsyncStorage.getItem("user"))
            context.setUser({ ...user, phone })
        }
        ToastAndroid.show('Wrong password', ToastAndroid.SHORT);
        return
    }
    return (
        <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
            <Text>LOGIN</Text>
            <TextInput
                value={phone}
                onChangeText={text => setPhone(text)}
            />
            <TextInput
                value={password}
                onChangeText={text => setPassword(text)}
            />
            <Button
                title="Login"
                onPress={handleLogin}
            />
        </SafeAreaView>
    )
}
