import {useNetInfo} from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';
import {useFocusEffect} from '@react-navigation/native';
import React, {useContext, useState} from 'react';
import {
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  View,
  Button,
  ActivityIndicator,
} from 'react-native';
import {AuthContext} from '../contexts/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import deepEqual from 'deep-equal';

export default function Historys() {
  const {devicesRef} = useContext(AuthContext);
  const [historys, setHistorys] = useState();
  const [numOfCurrent, setNumOfCurrent] = useState(10);
  const [has, setHas] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const netInfor = useNetInfo();

  useFocusEffect(
    React.useCallback(() => {
      const getHistorysLocal = async () => {
        if (!historys) {
          setHistorys(JSON.parse(await AsyncStorage.getItem('historys')));
        }
      };
      getHistorysLocal();
      return () => {
        getHistorysLocal;
      };
    }, [historys]),
  );

  useFocusEffect(
    React.useCallback(() => {
      console.log(devicesRef)
      if (devicesRef) {
        const historysRef = firestore()
          .collection('historys')
          .where('device', 'in', devicesRef)
          .orderBy('createAt', 'desc')
          .limit(numOfCurrent);
        const unsubscribe = historysRef.onSnapshot(async snapshot => {
          console.log('có thay đổi');
          setHas(
            (
              await firestore()
                .collection('historys')
                .where('device', 'in', devicesRef)
                .get()
            ).size > numOfCurrent,
          );
          const hists = [];
          await Promise.all(
            snapshot.docs.map(async doc => {
              const device = (await doc.data().device.get()).data();
              const createAt = await doc.data().createAt.toDate().toString();
              const history = {
                createAt,
                device,
                message: doc.data().message,
                id: doc.id,
              };
              if (doc.exists) {
                hists.push(history);
              }
            }),
          );
          console.log(deepEqual(historys, hists));
          if (!deepEqual(historys, hists)) {
            setHistorys(hists);
            setLoadMoreLoading(false);
            if (numOfCurrent == 10) {
              await AsyncStorage.setItem('historys', JSON.stringify(hists));
            }
            console.log('reset historys');
          }
        });
        return () => {
          unsubscribe();
        };
      }
    }, [netInfor, historys, numOfCurrent, devicesRef]),
  );
  return (
    <SafeAreaView style={{backgroundColor: 'dodgerblue', flex: 1}}>
      <Text
        style={{
          textAlign: 'center',
          fontSize: 25,
          fontWeight: 'bold',
          color: 'black',
          padding: 4,
          backgroundColor: 'royalblue',
        }}>
        History
      </Text>
      {netInfor.isConnected && (
        <FlatList
          data={historys}
          renderItem={({item}) => <Item notify={item} />}
          keyExtractor={item => item.id}
          item></FlatList>
      )}
      {has && (
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

const Item = ({notify: {message, createAt}}) => {
  const handleLongPress = async () => {};
  return (
    <TouchableOpacity onLongPress={handleLongPress}>
      <View
        style={{
          backgroundColor: 'white',
          color: 'black',
          borderRadius: 10,
          margin: 8,
          padding: 8,
        }}>
        <Text style={{color: 'black', fontSize: 16}}>
          <Text style={{fontWeight: 'bold'}}>Message: </Text>
          {message}
        </Text>
        <Text style={{color: 'black', fontSize: 16}}>
          <Text style={{fontWeight: 'bold'}}>Create at: </Text>
          {createAt}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
