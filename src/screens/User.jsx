import AsyncStorage from "@react-native-async-storage/async-storage"
import firestore from "@react-native-firebase/firestore"
import messaging from '@react-native-firebase/messaging'
import { useContext, useState } from "react"
import { Button, Image, SafeAreaView, Text, View } from "react-native"
import AddUser from "../components/AddUser"
import UpdatePassword from "../components/UpdatePassword"
import { AuthContext } from "../contexts/authContext"
import personImage from "../image/person.png"
export default function User() {
    const { user, setUser } = useContext(AuthContext)
    const [updatePassword, setUpdatePassword] = useState(false)
    const [addUser, setAddUser] = useState(false)
    const handleLogout = async () => {
        await AsyncStorage.clear()
        setUser()
        await messaging().registerDeviceForRemoteMessages();
        const token = await messaging().getToken();
        await firestore().collection('tokens').doc(user.phone).update({
            devices: firestore.FieldValue.arrayRemove(token)
        })
    }
    return (
        <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <Image source={user.image || personImage} style={{ width: 50, height: 50, borderRadius: 50, backgroundColor: "white", borderWidth: 1, borderColor: "green" }} />
                <Text>
                    {user.name}
                </Text>
                <Text>
                    {user.phone}
                </Text>
            </View>
            <Button title="Update password" onPress={() => { setUpdatePassword(!updatePassword) }} />
            {updatePassword && <UpdatePassword setUpdatePassword={setUpdatePassword} />}
            <Button title="Add user" onPress={() => { setAddUser(!addUser) }} />
            {addUser && <AddUser setAddUser={setAddUser} />}
            <Button
                title="Logout"
                onPress={handleLogout}
            />
        </SafeAreaView>
    )
}