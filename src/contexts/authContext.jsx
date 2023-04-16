import React, {createContext, useEffect, useState} from 'react';
import {useNetInfo} from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import deepEqual from 'deep-equal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay/lib';
export const AuthContext = createContext();

export default function AuthContextProvider({children}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const [addressDoorRef, setAddressDoorRef] = useState();
  const netInfor = useNetInfo();
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
      if (user && netInfor.isConnected) {
        const userRef = firestore().collection('users').doc(user.phone);
        const unsubscribe = userRef.onSnapshot(async doc => {
          const data = doc.data();
          const addressDoor = [];
          await Promise.all(
            data.addressDoor.map(async device => {
              const res = await device.get();
              //     console.log(doc.data())
              //     console.log("luồng device chạy")
              if (res.exists) {
                addressDoor.push(res.data());
              }
            }),
          );
          if (!deepEqual({...data, addressDoor, phone: user.phone}, user)) {
            console.log('set lai user o day');
            await AsyncStorage.setItem('user', JSON.stringify({...data, addressDoor, phone: user.phone}));
            setUser({...data, addressDoor, phone: user.phone});
          }
          setAddressDoorRef(data.addressDoor);
        });

        return () => unsubscribe();
      }
    }, [user, netInfor]),
    [user, netInfor],
  );
  const authContextData = {user, setUser, addressDoorRef};
  return (
    <AuthContext.Provider value={authContextData}>
      <Spinner visible={loading} />
      {!loading && children}
    </AuthContext.Provider>
  );
}
