import { API_URL } from "@env"
import { useState, useContext } from "react";
import { Button, SafeAreaView, Text, TextInput, ToastAndroid } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import firestore from "@react-native-firebase/firestore"
import { AuthContext } from "../contexts/authContext";
import axios from "axios"
export default function Login() {
    const context = useContext(AuthContext)

    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewpassword, setConfirmNewPassword] = useState("")
    const [verify, setVerify] = useState("")
    const [isWrongPassword, setIsWrongPassword] = useState(false)
    const [openNewPassword, setOpenNewPassword] = useState(false)
    const [resendVerifyCode, setResendVerifyCode] = useState(false)
    const handleLogin = async () => {
        const res = await firestore().collection('users').doc(phone).get()
        if (!res.exists) {
            ToastAndroid.show('Wrong phone number', ToastAndroid.SHORT);
            return
        }
        const user = res.data()
        const address = []
        await Promise.all(user.addressDoor.map(async (device) => {
            const res = await device.get()
            if (res.exists) {
                address.push(res.data())
            }
        }))
        user.addressDoor = address
        if (password === user.password) {
            await AsyncStorage.setItem("user", JSON.stringify({ ...user, phone }))
            context.setUser({ ...user, phone })
            return
        }
        setIsWrongPassword(true)
        ToastAndroid.show('Wrong password', ToastAndroid.SHORT);
        return
    }
    const handleUpdatePassword = async () => {
        if (phone.length != 10 || newPassword != confirmNewpassword || newPassword == "" || verify == "")
            return
        const resRef = firestore().collection('verifys')
        var docs = (await resRef.where('code', '==', Number.parseInt(verify)).get()).docs
        var res = docs.find(doc => doc.id === phone)
        if (!res) {
            ToastAndroid.show("Verify code incorrect", ToastAndroid.SHORT)
            return
        }
        if (res.data().expireAt.toDate() < new Date()) {
            ToastAndroid.show("Request is expire", ToastAndroid.SHORT)
            return
        }


        res = await firestore().collection('users').doc(phone).get()
        if (!res.exists) return
        user = res.data()
        user.password = newPassword

        await firestore().collection('users').doc(phone).set(user)


        setOpenNewPassword(false)
        setResendVerifyCode(false)
        setNewPassword("")
        setConfirmNewPassword("")
        setVerify("")
    }
    const handleSendVerifyCode = async () => {
        setIsWrongPassword(false)
        setOpenNewPassword(true)
        setResendVerifyCode(true)
        while (true) {
            try {
                const res = await axios.post(`${API_URL}:3000/users/resendVerifyCode`, { phone })
                console.log(res)
                break
            } catch (error) {
                console.log(error)
                continue
            }
        }
    }
    const handleResendVerifyCode = async () => {
        while (true) {
            try {
                const res = await axios.post(`${API_URL}:3000/users/resendVerifyCode`, { phone })
                console.log(res)
                break
            } catch (error) {
                console.log(error)
                continue
            }
        }
    }
    return (
        <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
            <Text>LOGIN</Text>
            <TextInput
                value={phone}
                placeholder="Phone number"
                onChangeText={text => setPhone(text)}
            />
            {openNewPassword ||
                <TextInput
                    value={password}
                    placeholder="Password"
                    onChangeText={text => setPassword(text)}
                />}
            {openNewPassword &&
                <TextInput
                    value={newPassword}
                    placeholder="New password"
                    onChangeText={text => setNewPassword(text)}
                />}
            {openNewPassword &&
                <TextInput
                    value={confirmNewpassword}
                    placeholder="Confirm new password"
                    onChangeText={text => setConfirmNewPassword(text)}
                />}
            {openNewPassword &&
                <TextInput
                    value={verify}
                    placeholder="Verify code"
                    onChangeText={text => setVerify(text)}
                />}
            {isWrongPassword && <Text style={{ fontSize: 12, color: "blue" }} onPress={handleSendVerifyCode}>Forget password</Text>}
            {resendVerifyCode && <Text style={{ fontSize: 12, color: "blue" }} onPress={handleResendVerifyCode}>Resend verify code</Text>}
            {!openNewPassword ?
                <Button
                    title="Login"
                    color={(phone && password) ? "blue" : 'gray'}
                    onPress={handleLogin}
                /> :
                <Button
                    title="Set password"
                    color={(verify && newPassword && confirmNewpassword) ? 'blue' : 'gray'}
                    onPress={handleUpdatePassword}
                />}
        </SafeAreaView>
    )
}
