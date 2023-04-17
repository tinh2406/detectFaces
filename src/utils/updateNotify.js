import { async } from '@firebase/util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore'

export async function FormatNotify(doc) {
    const device = (await doc.data().device.get()).data();
    const createAt = await doc.data().createAt.toDate().toString();
    const imgPath = await doc.data().imgPath
    var notify
    if (imgPath)
        notify = { createAt, device, message: doc.data().message, id: doc.id, imgPath };
    else
        notify = { createAt, device, message: doc.data().message, id: doc.id }
    return notify
}

export default async function UpdateNotifyBackground() {
    const { phone } = JSON.parse(await AsyncStorage.getItem('user'))
    console.log("Cập nhật thông báo ngầm")
    const { devices } = (await firestore().collection('users').doc(phone).get()).data()
    const devices_ = (await devices.get()).data().devices
    const notifyDocs = await firestore().collection('notifys').where('device', 'in', devices_).orderBy("createAt", 'desc').limit(10).get();
    const notis = [];
    await Promise.all(notifyDocs.docs.map(async (doc) => {
        if (doc.exists) {
            notis.push(await FormatNotify(doc));
        }
    }));
    if (notis) {
        await AsyncStorage.setItem('notifys', JSON.stringify(notis))
    }
}
