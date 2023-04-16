import storage from "@react-native-firebase/storage"
import firestore from "@react-native-firebase/firestore"

export const updateUser = async(fieldName,value,phone)=>{
    const res = await firestore().collection('users').doc(phone).get();
    if (!res.exists) return;
    const user = res.data()
    user[fieldName]=value
    await firestore().collection('users').doc(user.phone).set(user);
}


export const uploadImage = async (phone,image) => {
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
        await updateUser("image",url,phone)
    }).catch((error) => {
        console.log(error);
    });
}