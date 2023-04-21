import React, { useEffect, useState } from 'react';
import BluetoothSerial from 'react-native-bluetooth-serial';
import Modal from 'react-native-modal';
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    TextInput,
    Button,
    View
} from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';
import deepEqual from "deep-equal"



export default ({ address }) => {
    const { addressBluetooth, name } = address;
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [reConnect, setReConnect] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [wifiName, setWifiName] = useState('');
    const [password, setPassword] = useState('');
    const [newRes,setNewRes] = useState();
    useEffect(() => {
        if (addressBluetooth !== "thieu") {
            console.log("res connect")
            BluetoothSerial.connect(addressBluetooth)
                .then(res => {
                    console.log(res, "Connected")
                    setIsConnected(true)
                    const id = setInterval(() => {
                        //   // Hành động cần thực hiện sau mỗi khoảng thời gian
                        BluetoothSerial.readFromDevice().then(res => {
                            if (res != "") {
                                const _res = (JSON.parse(String(res)))
                                console.log(newRes, "Giá trị đọc được")
                                setStatus(_res.status == 0 ? false : true)
                                if(!deepEqual(_res,newRes)){
                                    setNewRes(_res)
                                }
                                if(wifiName=="" && newRes){
                                    setWifiName(newRes.wifiName)
                                    setPassword(newRes.password)
                                }
                            }
                        }).catch(error => {
                            console.log(error, "Lôi đọc")
                        })

                    }, 1000);
                    setIntervalId(id);
                })
                .catch(error => {
                    setIsConnected(false)
                    console.log(error, "connect fail")
                })
        }
    }, [reConnect,newRes])
    useEffect(() => {
        return () => {
            clearInterval(intervalId);
        };
    }, [intervalId, reConnect])
    const handleTogglePress = async () => {
        setLoading(true);
        if (status) {
            BluetoothSerial.write('0').
                then(response => {
                    console.log(response, 'Lock res');
                    setStatus(false)
                    setTimeout(() => {
                        setLoading(false)
                    }, 1500)

                })
                .catch(error => {
                    Alert.alert(`${error}`)
                    setLoading(false)

                });
        } else {
            BluetoothSerial.write('1').
                then(response => {
                    console.log(response, 'Unlock res');
                    setStatus(true)
                    setTimeout(() => {
                        setLoading(false)
                    }, 1500)

                })
                .catch(error => {
                    Alert.alert(`${error}`)
                    setLoading(false)

                });
        }
    };
    const handleLongPress = () => {
        setModalVisible(true)
    };
    const handleOK = () => {
        BluetoothSerial.write(JSON.stringify({wifiName,password}))
        .then(res=>{
            console.log("Gui wifi thanh cong",res)
        })
        .catch(error=>{
            console.log("Gui wifi loi",error)
        })
        setWifiName("")
        setPassword("")
        setModalVisible(false)
    };
    return (
        <>
            <TouchableOpacity onLongPress={handleLongPress}
                onPress={() => {
                    setReConnect(!reConnect)
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        backgroundColor: isConnected ? "#8dfcb4" : 'white',
                        color: 'black',
                        borderRadius: 10,
                        margin: 8,
                        padding: 8,
                    }}>
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={{ color: 'black', fontSize: 16 }}>{addressBluetooth}</Text>
                        <Text style={{ color: 'black', fontSize: 16 }}>{name}</Text>
                    </View>
                    {loading ? (
                        <ActivityIndicator
                            size="large"
                            color={status ? 'gray' : '#00ff00'}
                        />
                    ) : (
                        <ToggleSwitch
                            isOn={status}
                            onColor="green"
                            offColor="gray"
                            onToggle={handleTogglePress}
                        />
                    )}
                </View>
            </TouchableOpacity>
            <Modal isVisible={isModalVisible}>
                <View style={{ backgroundColor: '#000000', padding: 20 }}>
                    <Text style={{paddingHorizontal:4}}>Wifi</Text>
                    <TextInput
                        placeholder="Wifi name"
                        placeholderTextColor={"#342353"}
                        value={wifiName}
                        onChangeText={setWifiName}
                    />
                    <Text style={{paddingHorizontal:4}}>Password</Text>
                    <TextInput
                        placeholder="Password"
                        placeholderTextColor={"#342353"}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Button title="OK" onPress={handleOK} />
                </View>
            </Modal>
        </>
    );
};
