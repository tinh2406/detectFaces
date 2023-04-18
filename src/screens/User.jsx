import AsyncStorage from "@react-native-async-storage/async-storage";
import Logout from '../utils/logout'
import { useContext, useEffect, useState } from "react";
import { Button, Image, KeyboardAvoidingView, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import AddUser from "../components/AddUser";
import UpdatePassword from "../components/UpdatePassword";
import { AuthContext } from "../contexts/authContext";
import personImage from "../image/person.png";
import DownloadImage from "../utils/downloadImage";
import { uploadImage } from "../utils/firebaseHelper";

export default function User() {
    const { user, setUser, setDevicesRef } = useContext(AuthContext)
    const [image, setImage] = useState(null);
    const [updatePassword, setUpdatePassword] = useState(false)
    const [addUser, setAddUser] = useState(false)
    const handleLogout =async ()=>{
        await Logout(user,setUser,setDevicesRef)
    }
    const chooseImage = () => {
        try {
            launchImageLibrary({ mediaType: 'photo' }, async (res) => {
                console.log(res)
                if (res.assets) {
                    const assets = res.assets
                    if (assets) {
                        setImage(assets[0].uri);
                    }
                }
            })
                .then(async (res) => {
                    console.log(res)
                    if (res.assets) {
                        const assets = res.assets
                        if (assets[0]) {
                            await uploadImage(user.phone, assets[0].uri);
                            await AsyncStorage.setItem('imageUrl', assets[0].uri)
                        }
                    }
                })
        } catch (error) {

        }
        console.log(image)
    }
    useEffect(() => {
        const unsub = async () => {
            const res = await AsyncStorage.getItem('imageUrl')
            if (!res && user.image) {
                const downloadImage = await DownloadImage(user.image)
                await AsyncStorage.setItem('imageUrl', downloadImage)
                setImage(downloadImage)
            }
            else {
                setImage(res)
            }
            console.log(res, "abc")
        }
        unsub()
    }, [user])

    return (

        <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
            <ScrollView>
                <KeyboardAvoidingView behavior="height" style={{marginBottom:200}}>
                    <View style={{ display: "flex", flexDirection: "row", backgroundColor: "#606060", margin: 16, padding: 12, borderRadius: 10, alignItems: "center" }}>
                        <TouchableOpacity onPress={chooseImage} >
                            {
                                image ?
                                    <Image source={{ uri: image }} style={{ width: 50, height: 50, borderRadius: 50, backgroundColor: "white", borderWidth: 1, }} />
                                    : (user.image ?
                                        <Image src={user.image} style={{ width: 50, height: 50, borderRadius: 50, backgroundColor: "white", borderWidth: 1, }} /> :
                                        <Image source={personImage} style={{ width: 50, height: 50, borderRadius: 50, backgroundColor: "white", borderWidth: 1, }} />)
                            }
                        </TouchableOpacity>
                        <View style={{ marginLeft: 20 }}>
                            <Text style={{ fontSize: 20 }}>
                                {user.name}
                            </Text>
                            <Text style={{ fontSize: 16 }}>
                                {user.phone}
                            </Text>
                        </View>
                    </View>
                    <View style={{ borderBottomWidth: 2, borderBottomColor: "#c0c0c0", marginBottom: 8 }}></View>
                    <TouchableOpacity onPress={() => { setUpdatePassword(!updatePassword) }} >
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                marginTop: 16,
                                padding: 12,
                                paddingHorizontal: 20,
                                borderColor: "#606060",
                                borderTopWidth: 1,
                            }}>
                            <Text style={{ fontSize: 16 }}>Update password</Text>
                        </View>
                    </TouchableOpacity>
                    {updatePassword && <UpdatePassword setUpdatePassword={setUpdatePassword} />}
                    <TouchableOpacity onPress={() => { setAddUser(!addUser) }} >
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                padding: 12,
                                paddingLeft: 20,
                                borderColor: "#606060",
                                borderTopWidth: 1,
                            }}>
                            <Text style={{ fontSize: 16 }}>Add user</Text>
                        </View>
                    </TouchableOpacity>
                    {addUser && <AddUser setAddUser={setAddUser} />}

                    <View style={{ borderBottomWidth: 2, borderBottomColor: "#c0c0c0", marginVertical: 2 }}></View>

                    <TouchableOpacity onPress={handleLogout} >
                        <View
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                backgroundColor: "#606060",
                                margin: 16, padding: 12,
                                borderRadius: 10,
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                            <Text style={{ fontSize: 16 }}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    )
}