import {API_URL} from "@env"
import { useState, useRef, useEffect } from 'react'
import { View, StyleSheet, Text } from "react-native"
import axios from 'axios';
import { RNCamera } from "react-native-camera"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function GetFace({ navigation, route }) {
  const type = RNCamera.Constants.Type.front;
  const [count, setCount] = useState(0)
  const [message,setMessage] = useState()
  const [takePicture,setTakePicture] = useState(true)
  const [box, setBox] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0
  });
  const [cameraRef, setCameraRef] = useState()
  const handlerFace = async ({ faces }) => {
    const handle = async () => {
      // if (faces[0] && faces[0].bounds.size.width > 200 && faces[0].bounds.size.height > 300) {
        try {
          if(takePicture){
            const photo = await cameraRef.takePictureAsync({ quality: 0.5, doNotSave: false, base64: true,width:480,height:720 })
            setTakePicture(false)
            await uploadImage(photo.base64)
          }
        } catch (error) {
          console.log(count)
        }
        // setBox({
        //   w: faces[0].bounds.size.width,
        //   h: faces[0].bounds.size.height,
        //   x: faces[0].bounds.origin.x,
        //   y: faces[0].bounds.origin.y,
        // });
      // } else {
      //   setBox(null);
      // }
    }
    await handle()
  }
  const uploadImage = async (image) => {
    try {
      const { phone } = JSON.parse(await AsyncStorage.getItem('user'))
      const res = await axios.post(`${API_URL}:3000/api/upload`, { phone, name: route.params.name, count, image })
      // console.log(res)
      while(true){
        if (res.data.message === "success") {
          navigation.navigate("HomeTabs", { screen: "AddFace", message: "add face successfully" })
          setTakePicture(true)
          setMessage(undefined)
          return true
        }
        if (res.data.message === "need further data"){
          if(5-count==1){
            setMessage("Chờ xử lí")
            console.log("Chowf xuwr li")
          }
          else
          setMessage("Ok")
          setCount(count + 1)
          setTakePicture(true)
          return true
        }
        if(res.data.message)
          setTakePicture(true)
          setMessage(res.data.message)
          return true
      }
      
    } catch (error) {
      console.log(error)
    }
  };
  return (
    <View style={styles.container}>
      <RNCamera
        ref={ref => { setCameraRef(ref) }}
        style={styles.camera}
        type={type}
        captureAudio={false}
        onFacesDetected={handlerFace}
        faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.all}
      />
      {box && (
        <>
          <View
            style={styles.bound({
              width: box.w,
              height: box.h,
              x: box.x,
              y: box.y,
            })}
          />
        </>
      )}
      <Text style={{position:"absolute",fontSize:30,color:"green"}}>{5-count}</Text>
      {message&&<Text style={{position:"absolute",fontSize:30,color:"green",bottom:0}}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
  },
  camera: {
    flexGrow: 1,
  },
  bound: ({ width, height, x, y }) => {
    return {
      position: 'absolute',
      top: y,
      left: x - 50,
      height,
      width,
      borderWidth: 5,
      borderColor: 'red',
      zIndex: 3000,
    };
  },
});


