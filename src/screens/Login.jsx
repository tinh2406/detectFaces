import {API_URL} from '@env';
import {useState, useContext} from 'react';
import {
  Button,
  SafeAreaView,
  Text,
  TextInput,
  ToastAndroid,
  Image,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import {AuthContext} from '../contexts/authContext';
import axios from 'axios';
export default function Login() {
  const context = useContext(AuthContext);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewpassword, setConfirmNewPassword] = useState('');
  const [verify, setVerify] = useState('');
  const [isWrongPassword, setIsWrongPassword] = useState(false);
  const [openNewPassword, setOpenNewPassword] = useState(false);
  const [resendVerifyCode, setResendVerifyCode] = useState(false);
  const handleLogin = async () => {
    const res = await firestore().collection('users').doc(phone).get();
    if (!res.exists) {
      ToastAndroid.show('Wrong phone number', ToastAndroid.SHORT);
      return;
    }
    const user = res.data();
    const address = [];
    await Promise.all(
      user.addressDoor.map(async device => {
        const res = await device.get();
        if (res.exists) {
          address.push(res.data());
        }
      }),
    );
    user.addressDoor = address;
    if (password === user.password) {
      await AsyncStorage.setItem('user', JSON.stringify({...user, phone}));
      context.setUser({...user, phone});
      return;
    }
    setIsWrongPassword(true);
    ToastAndroid.show('Wrong password', ToastAndroid.SHORT);
    return;
  };
  const handleUpdatePassword = async () => {
    if (
      phone.length != 10 ||
      newPassword != confirmNewpassword ||
      newPassword == '' ||
      verify == ''
    )
      return;
    const resRef = firestore().collection('verifys');
    var docs = (await resRef.where('code', '==', Number.parseInt(verify)).get())
      .docs;
    var res = docs.find(doc => doc.id === phone);
    if (!res) {
      ToastAndroid.show('Verify code incorrect', ToastAndroid.SHORT);
      return;
    }
    if (res.data().expireAt.toDate() < new Date()) {
      ToastAndroid.show('Request is expire', ToastAndroid.SHORT);
      return;
    }

    res = await firestore().collection('users').doc(phone).get();
    if (!res.exists) return;
    user = res.data();
    user.password = newPassword;

    await firestore().collection('users').doc(phone).set(user);

    setOpenNewPassword(false);
    setResendVerifyCode(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setVerify('');
  };
  const handleSendVerifyCode = async () => {
    setIsWrongPassword(false);
    setOpenNewPassword(true);
    setResendVerifyCode(true);
    while (true) {
      try {
        const res = await axios.post(`${API_URL}:3000/users/resendVerifyCode`, {
          phone,
        });
        console.log(res);
        break;
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  };
  const handleResendVerifyCode = async () => {
    while (true) {
      try {
        const res = await axios.post(`${API_URL}:3000/users/resendVerifyCode`, {
          phone,
        });
        console.log(res);
        break;
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  };
  return (
    <SafeAreaView
      style={{
        backgroundColor: 'dodgerblue',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 32,
          color: 'white',
          fontWeight: 'bold',
        }}>
        LOGIN
      </Text>
      <Image
        source={require('./../image/person.png')}
        style={{
          width: 150,
          height: 150,
          tintColor: 'white',
          alignSelf: 'center',
        }}
      />

      <TextInput
        style={{
          color: 'black',
          backgroundColor: 'white',
          borderRadius: 30,
          padding: 15,
          width: '80%',
          margin: 15,
        }}
        value={phone}
        placeholderTextColor="gray"
        placeholder="Phone number"
        onChangeText={text => setPhone(text)}
      />
      {openNewPassword || (
        <TextInput
          style={{
            color: 'black',
            backgroundColor: 'white',
            borderRadius: 30,
            padding: 15,
            width: '80%',
            margin: 15,
          }}
          value={password}
          placeholderTextColor="gray"
          secureTextEntry={true}
          placeholder="Password"
          onChangeText={text => setPassword(text)}
        />
      )}
      {openNewPassword && (
        <TextInput
          style={{
            color: 'black',
            backgroundColor: 'white',
            borderRadius: 30,
            padding: 15,
            width: '80%',
            margin: 15,
          }}
          value={newPassword}
          placeholderTextColor="gray"
          placeholder="New password"
          secureTextEntry={true}
          onChangeText={text => setNewPassword(text)}
        />
      )}
      {openNewPassword && (
        <TextInput
          style={{
            color: 'black',
            backgroundColor: 'white',
            borderRadius: 30,
            padding: 15,
            width: '80%',
            margin: 15,
          }}
          value={confirmNewpassword}
          placeholderTextColor="gray"
          placeholder="Confirm new password"
          secureTextEntry={true}
          onChangeText={text => setConfirmNewPassword(text)}
        />
      )}
      {openNewPassword && (
        <TextInput
          style={{
            color: 'black',
            backgroundColor: 'white',
            borderRadius: 30,
            padding: 15,
            width: '80%',
            margin: 15,
          }}
          value={verify}
          placeholderTextColor="gray"
          placeholder="Verify code"
          onChangeText={text => setVerify(text)}
        />
      )}
      {isWrongPassword && (
        <Text
          style={{fontSize: 16, color: 'blue', fontWeight: 'bold'}}
          onPress={handleSendVerifyCode}>
          Forget password ?
        </Text>
      )}
      {resendVerifyCode && (
        <Text
          style={{fontSize: 16, color: 'blue', fontWeight: 'bold'}}
          onPress={handleResendVerifyCode}>
          Resend verify code
        </Text>
      )}
      {!openNewPassword ? (
        <View style={{width: '80%', padding: 15}}>
          <Button
            title="Login"
            color={phone && password ? 'blue' : 'gray'}
            onPress={handleLogin}
          />
        </View>
      ) : (
        <View style={{width: '80%', padding: 15}}>
          <Button
            title="Set password"
            color={
              verify && newPassword && confirmNewpassword ? 'blue' : 'gray'
            }
            onPress={handleUpdatePassword}
            style={{
              color: 'black',
              backgroundColor: 'white',
              borderRadius: 30,
              padding: 15,
              width: '80%',
              margin: 15,
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
