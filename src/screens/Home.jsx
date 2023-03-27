import { SafeAreaView } from "react-native"
import Historys from "../components/Historys"

import React from "react"


export default function Home({ navigation }) {


    return (
        <SafeAreaView style={{ backgroundColor: "black", flex: 1 }}>
            <Historys />

        </SafeAreaView>

    )
}