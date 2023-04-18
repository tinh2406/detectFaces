import React, { createContext, useEffect, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import deepEqual from 'deep-equal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import { GetUserFirebase } from '../utils/firebaseHelper';
import logout from '../utils/logout';
export const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const [devicesRef, setDevicesRef] = useState();
  const [deviceUserRef, setDeviceUserRef] = useState();
  const [devicesId, setDevicesId] = useState({});
  const netInfor = useNetInfo();
  useEffect(
    React.useCallback(() => {
      if (user && netInfor.isConnected) {
        const userRef = firestore().collection('users').doc(user.phone);
        const unsubscribe = userRef.onSnapshot(async doc => {
          const getUser = await GetUserFirebase(doc)
          if(!doc.data()) {
            logout(user,setUser,setDevicesRef)
            return
          }
          if(!deviceUserRef){
            setDeviceUserRef(doc.data().devices)
          }
          if (!deepEqual(getUser, user)) {
            console.log('set lai user o day');
            await AsyncStorage.setItem('user', JSON.stringify(getUser));
            setUser(getUser);
            setDeviceUserRef(doc.data().devices)
          }
        });

        return () => unsubscribe();
      }
    }, [user, netInfor,devicesRef]),
    [user, netInfor,devicesRef],
  );
  useEffect(
    React.useCallback(() => {
      const getRegisteredUser = async () => {
        const _user = JSON.parse(await AsyncStorage.getItem('user'));
        if (!user) {
          setUser(_user);
        }
        setLoading(false);
      };
      getRegisteredUser();
      return () => {
        getRegisteredUser;
      };
    }, []),
    [],
  );
  useEffect(
    React.useCallback(() => {
      if (user && netInfor.isConnected && deviceUserRef) {
        const unsubscribe = deviceUserRef.onSnapshot(async doc => {
          const _devicesRef = doc.data().devices
          const newDevicesId = [];
          await Promise.all(
            _devicesRef.map(async device => {
              newDevicesId.push((await device.get()).id)
            })
          );
          console.log(newDevicesId,"deviceId")
          if (!devicesRef||!deepEqual(newDevicesId, devicesId)) {
            console.log('set lai deviceRef o day');
            setDevicesId(newDevicesId)
            setDevicesRef(_devicesRef);
          }
        });

        return () => unsubscribe();
      }
    }, [user, netInfor,devicesId,deviceUserRef]),
    [user, netInfor,devicesId,deviceUserRef],
  );
  
  const authContextData = { user, setUser, devicesRef,setDevicesRef,setDeviceUserRef };
  return (
    <AuthContext.Provider value={authContextData}>
      <Spinner visible={loading} />
      {!loading && children}
    </AuthContext.Provider>
  );
}
