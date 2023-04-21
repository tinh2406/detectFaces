import {API_URL} from '@env';
import {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import {AuthContext} from '../contexts/authContext';
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function UserList({setUserListPanel}) {
  const [userList, setUserList] = useState('');
  const {user} = useContext(AuthContext);

  useEffect(() => {
    axios
      .get(`${API_URL}:3000/users/userList`)
      .then(res => {
        const filteredData = res.data.filter(item => item.owner == user.phone);
        setUserList(filteredData);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <SafeAreaView>
      {userList ? (
        userList.map(item => (
          <Item
            item={item}
            key={item.phone}
            setUserListPanel={setUserListPanel}
          />
        ))
      ) : (
        <Text style={{textAlign: 'center', color: 'white', fontSize: 16}}>
          Loading...
        </Text>
      )}
    </SafeAreaView>
  );
}

const Item = props => {
  const handleDelete = () => {
    axios
      .post(`${API_URL}:3000/users/deleteUser`, {phone: props.item.phone})
      .then(res => {
        ToastAndroid.show(res.data.message, ToastAndroid.SHORT);
        props.setUserListPanel(false);
        props.setUserListPanel(true);
      })
      .catch(err => {
        ToastAndroid.show(err, ToastAndroid.SHORT);
      });
  };

  const handleLongPress = async () => {
    Alert.alert('Alert', 'Bạn có chắc chắn muốn xóa người dùng này', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          console.log(props.item.phone);
          handleDelete();
        },
      },
    ]);
  };
  return (
    <TouchableOpacity onLongPress={handleLongPress}>
      <View
        style={{
          backgroundColor: 'white',
          color: 'black',
          borderRadius: 10,
          margin: 8,
          padding: 8,
          marginTop: 10,
        }}>
        <Text style={{color: 'black', fontSize: 16}}>
          <Text style={{fontWeight: 'bold'}}>Name: </Text>
          {props.item.name}
        </Text>
        <Text style={{color: 'black', fontSize: 16}}>
          <Text style={{fontWeight: 'bold'}}>Phone: </Text>
          {props.item.phone}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
