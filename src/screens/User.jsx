import AsyncStorage from "@react-native-async-storage/async-storage"
import { useContext, useState} from "react"
import { SafeAreaView, Text,Button, View, Image } from "react-native"
import AddUser from "../components/AddUser"
import UpdatePassword from "../components/UpdatePassword"
import { AuthContext } from "../contexts/authContext"
import personImage from "../image/person.png"
export default function User(){
    const {user,setUser} = useContext(AuthContext)
    const [updatePassword,setUpdatePassword] = useState(false)
    const [addUser,setAddUser] = useState(false)
    return(
        <SafeAreaView style={{backgroundColor:"black",flex:1}}>
            <View style={{display:"flex",flexDirection:"row",alignItems:"center"}}>
                <Image source={user.image || personImage} style={{width:50,height:50,borderRadius:50,backgroundColor:"white",borderWidth:1,borderColor:"green"}}/>
                <Text>
                    {user.name}
                </Text>
                <Text>
                    {user.phone}
                </Text>
            </View>
            <Button title="Update password" onPress={()=>{setUpdatePassword(!updatePassword)}}/>
            {updatePassword&&<UpdatePassword setUpdatePassword={setUpdatePassword}/>}
            <Button title="Add user" onPress={()=>{setAddUser(!addUser)}}/>
            {addUser&&<AddUser setAddUser={setAddUser}/>}
            <Button 
                title="Logout"
                onPress={async()=>{
                    await AsyncStorage.clear()
                    setUser()
                }}
            />
        </SafeAreaView>
    )
}