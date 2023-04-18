import AsyncStorage from "@react-native-async-storage/async-storage";
import firestore from "@react-native-firebase/firestore";
import messaging from '@react-native-firebase/messaging';
export default async (user, setUser, setDevicesRef) => {

    await AsyncStorage.clear()
    setUser()
    setDevicesRef()
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    await firestore().collection('tokens').doc(user.phone).update({
        devices: firestore.FieldValue.arrayRemove(token)
    })
}