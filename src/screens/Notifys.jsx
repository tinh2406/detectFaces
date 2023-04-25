import { useNetInfo } from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  View,
  Button,
  Image,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../contexts/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import deepEqual from 'deep-equal';
import FormatDate from '../utils/formatDate';
import { FormatNotify } from '../utils/updateNotify';
export default function Notifys({ navigation }) {
  const { user, devicesRef } = useContext(AuthContext);
  const [notifys, setNotifys] = useState();
  const [numOfCurrent, setNumOfCurrent] = useState(10);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [has, setHas] = useState(false);
  const netInfor = useNetInfo();
  useFocusEffect(
    React.useCallback(() => {
      const getNotifysLocal = async () => {
        const notifysLocal = JSON.parse(await AsyncStorage.getItem('notifys'));
        if (
          !notifys ||
          (notifys && notifys[0].createAt < notifysLocal[0].createAt)
        ) {
          setNotifys(notifysLocal);
        }
      };
      getNotifysLocal();
      return () => {
        getNotifysLocal;
      };
    }, [notifys]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (devicesRef && netInfor.isConnected) {
        const notifysRef = firestore()
          .collection('notifys')
          .where('device', 'in', devicesRef)
          .orderBy('createAt', 'desc')
          .limit(numOfCurrent);
        const unsubscribe = notifysRef.onSnapshot(async snapshot => {
          setHas(
            (
              await firestore()
                .collection('notifys')
                .where('device', 'in', devicesRef)
                .get()
            ).size > numOfCurrent,
          );
          const notis = [];
          await Promise.all(
            snapshot.docs.map(async doc => {
              if (doc.exists) {
                notis.push(await FormatNotify(doc));
              }
            }),
          );
          console.log(deepEqual(notifys, notis));
          if (!deepEqual(notifys, notis)) {
            setLoadMoreLoading(false);
            setNotifys(notis);
            if (numOfCurrent == 10) {
              await AsyncStorage.setItem('notifys', JSON.stringify(notis));
            }
            console.log('reset notifys');
          }
        });
        return () => {
          unsubscribe();
        };
      }
    }, [netInfor, notifys, numOfCurrent, devicesRef]),
  );
  return (
    <SafeAreaView style={{ backgroundColor: 'dodgerblue', flex: 1 }}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 25,
          fontWeight: 'bold',
          color: 'black',
          padding: 4,
          backgroundColor: 'royalblue',
        }}>
        Notify
      </Text>
      {notifys ? <FlatList
        data={notifys}
        renderItem={({ item }) => (
          <Item notify={item} navigation={navigation} />
        )}
        keyExtractor={item => item.id}
        item></FlatList> : <ActivityIndicator size="large" color={'#ffffff'} />}

      {has && notifys && (
        <View>
          {loadMoreLoading ? (
            <ActivityIndicator size="large" color={'#ffffff'} />
          ) : (
            <Button
              color="royalblue"
              onPress={() => {
                setLoadMoreLoading(true);
                setNumOfCurrent(numOfCurrent + 10);
              }}
              disabled={loadMoreLoading}
              title="Load more"
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const Item = ({ notify: { message, createAt, imgPath, id }, navigation }) => {
  const createAtFormat = FormatDate(createAt);
  const [url, setUrl] = useState();
  useFocusEffect(
    React.useCallback(() => {
      const getUrl = async () => {
        if (imgPath) {
          if (imgPath.includes('appspot.com/'))
            imgPath = imgPath.split('appspot.com/')[1];
          setUrl(await storage().ref(imgPath).getDownloadURL());
        }
      };
      getUrl();
      return getUrl;
    }, [imgPath]),
  );
  const handleLongPress = async () => { };
  const handlePress = () => {
    navigation.navigate('Notify', { id });
  };
  return (
    <TouchableOpacity onLongPress={handleLongPress} onPress={handlePress}>
      <View
        style={{
          flex: 1,
          justifyContent: 'space-between',
          flexDirection: 'row',

        }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            flexDirection: 'row',
            backgroundColor: 'white',
            width: '95%',
            borderRadius: 10,
            margin: 8,
            padding: 8,
            overflow:'hidden'
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              color: 'black',
              width: '65%',
            }}>
            <Text style={{ color: 'black', fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>Message: </Text>
              {message}
            </Text>
            <Text style={{ color: 'black', fontSize: 16 }}>
              <Text style={{ fontWeight: 'bold' }}>Create at: </Text>
              {createAtFormat}
            </Text>
          </View>
          {url &&
            <Image src={url} style={{ width: 40, backgroundColor: "red" }} alt={imgPath}></Image>
          }
        </View>
      </View>
    </TouchableOpacity>
  );
};
