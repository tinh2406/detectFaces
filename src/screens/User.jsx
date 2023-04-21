import AsyncStorage from '@react-native-async-storage/async-storage';
import Logout from '../utils/logout';
import {useContext, useEffect, useState} from 'react';
import {
  Button,
  Image,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import AddUser from '../components/AddUser';
import UpdatePassword from '../components/UpdatePassword';
import {AuthContext} from '../contexts/authContext';
import personImage from '../image/person.png';
import DownloadImage from '../utils/downloadImage';
import {uploadImage} from '../utils/firebaseHelper';
import UserList from '../components/UserList';

export default function User() {
  const {user, setUser, setDevicesRef} = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [updatePassword, setUpdatePassword] = useState(false);
  const [userListPanel, setUserListPanel] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const handleLogout = async () => {
    await Logout(user, setUser, setDevicesRef);
  };
  const chooseImage = () => {
    try {
      launchImageLibrary({mediaType: 'photo'}, async res => {
        console.log(res);
        if (res.assets) {
          const assets = res.assets;
          if (assets) {
            setImage(assets[0].uri);
          }
        }
      }).then(async res => {
        console.log(res);
        if (res.assets) {
          const assets = res.assets;
          if (assets[0]) {
            await uploadImage(user.phone, assets[0].uri);
            await AsyncStorage.setItem('imageUrl', assets[0].uri);
          }
        }
      });
    } catch (error) {}
    console.log(image);
  };
  useEffect(() => {
    const unsub = async () => {
      const res = await AsyncStorage.getItem('imageUrl');
      if (!res && user.image) {
        const downloadImage = await DownloadImage(user.image);
        await AsyncStorage.setItem('imageUrl', downloadImage);
        setImage(downloadImage);
      } else {
        setImage(res);
      }
      console.log(res, 'abc');
    };
    unsub();
  }, [user]);

  return (
    <SafeAreaView style={{backgroundColor: 'dodgerblue', flex: 1}}>
      <ScrollView>
        <KeyboardAvoidingView behavior="height" style={{marginBottom: 200}}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: 'white',

              margin: 16,
              padding: 12,
              borderRadius: 10,
              alignItems: 'center',
            }}>
            <TouchableOpacity onPress={chooseImage}>
              {image ? (
                <Image
                  source={{uri: image}}
                  style={{
                    width: 75,
                    height: 75,
                    borderRadius: 50,
                    backgroundColor: 'white',
                    borderWidth: 1,
                  }}
                />
              ) : user.image ? (
                <Image
                  src={user.image}
                  style={{
                    width: 75,
                    height: 75,
                    borderRadius: 50,
                    backgroundColor: 'white',
                    borderWidth: 1,
                  }}
                />
              ) : (
                <Image
                  source={personImage}
                  style={{
                    width: 75,
                    height: 75,
                    borderRadius: 50,
                    backgroundColor: 'white',
                    borderWidth: 1,
                  }}
                />
              )}
            </TouchableOpacity>
            <View style={{marginLeft: 20}}>
              <Text style={{fontSize: 22, color: 'black', fontWeight: 'bold'}}>
                {user.name}
              </Text>
              <Text style={{fontSize: 18, color: 'black'}}>{user.phone}</Text>
              {user.owner == true && (
                <Text style={{fontSize: 18, color: 'black'}}>Owner</Text>
              )}
            </View>
          </View>
          {user.owner == true && (
            <TouchableOpacity
              onPress={() => {
                setUserListPanel(!userListPanel);
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginTop: 16,
                  paddingTop: 12,
                  borderColor: 'white',
                  borderTopWidth: 2,
                  paddingLeft: 20,
                }}>
                <Text style={{fontSize: 18, color: 'white'}}>User List</Text>
              </View>
            </TouchableOpacity>
          )}
          {userListPanel && <UserList setUserListPanel={setUserListPanel} />}
          <TouchableOpacity
            onPress={() => {
              setUpdatePassword(!updatePassword);
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginTop: 16,
                padding: 12,
                paddingHorizontal: 20,
                borderColor: 'white',
                borderTopWidth: 2,
              }}>
              <Text style={{fontSize: 18, color: 'white'}}>
                Update password
              </Text>
            </View>
          </TouchableOpacity>
          {updatePassword && (
            <UpdatePassword setUpdatePassword={setUpdatePassword} />
          )}
          <TouchableOpacity
            onPress={() => {
              setAddUser(!addUser);
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                padding: 12,
                paddingLeft: 20,
                borderColor: 'white',
                borderTopWidth: 2,
              }}>
              <Text style={{fontSize: 18, color: 'white'}}>Add user</Text>
            </View>
          </TouchableOpacity>
          {addUser && (
            <AddUser
              setAddUser={setAddUser}
              setUserListPanel={setUserListPanel}
            />
          )}

          <View
            style={{
              borderBottomWidth: 2,
              borderBottomColor: 'white',
              marginVertical: 2,
            }}></View>

          <TouchableOpacity onPress={handleLogout}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: 'blue',
                margin: 16,
                padding: 12,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
