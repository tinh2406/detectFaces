import storage from "@react-native-firebase/storage"
import firestore from "@react-native-firebase/firestore"

export const updateUser = async (fieldName, value, phone) => {
    const res = await firestore().collection('users').doc(phone).get();
    if (!res.exists) return;
    const user = res.data()
    user[fieldName] = value
    await firestore().collection('users').doc(user.phone).set(user);
}


export const uploadImage = async (phone, image) => {
    const reference = storage().ref('avatar/');
    const response = await fetch(image);
    const blob = await response.blob();
    const fileName = phone;
    await reference.child(fileName).delete()
    const uploadTask = reference.child(fileName).put(blob);
    uploadTask.on('state_changed', (taskSnapshot) => {
        console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
    });
    uploadTask.then(async () => {
        console.log('Image uploaded to the bucket!');
        // Lấy url của ảnh sau khi upload
        const url = await reference.child(fileName).getDownloadURL();
        await updateUser("image", url, phone)
    }).catch((error) => {
        console.log(error);
    });
}



export const AddDeviceTokenToFirebase = async (phone, token) => {
    try {
        await firestore()
            .collection('tokens')
            .doc(phone)
            .update({
                devices: firestore.FieldValue.arrayUnion(token),
            });
    } catch (error) {
        await firestore()
            .collection('tokens')
            .doc(phone)
            .set(
                {
                    devices: [token],
                },
                { merge: true },
            );
    }
    return token
}



export const GetUserFirebase = async (doc) => {
    const data = await doc.data();
    const devices = await (await data.devices.get()).data().devices;
    const addressDoor = [];
    await Promise.all(
        devices.map(async device => {
            const res = await device.get();
            //     console.log(doc.data())
            //     console.log("luồng device chạy")
            if (res.exists) {
                addressDoor.push(res.data());
            }
        }),
    );
    console.log("get user firebase",{...data,devices:addressDoor, phone: doc.id})
    return {...data,devices:addressDoor, phone: doc.id}
}



export const UpdatePasswordFirebase = async (phone,newPassword)=>{
    const res = await firestore().collection('users').doc(phone).get();
    if (!res.exists) return;
    user = res.data();
    user.password = newPassword;

    await firestore().collection('users').doc(phone).set(user);
}