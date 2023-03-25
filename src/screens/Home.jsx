import { SafeAreaView, Text } from "react-native"
import Historys from "../components/Historys"




export default function Home({navigation}){
    
    return(
        <SafeAreaView style={{backgroundColor:"black",flex:1}}>
            <Historys/>
            
        </SafeAreaView>
        
    )
}