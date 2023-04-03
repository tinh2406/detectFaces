import { NavigationContainer } from "@react-navigation/native";
import App from "./App";
import AuthContextProvider from "./src/contexts/authContext";
export default function _App() {
    return (
        <AuthContextProvider>
            <NavigationContainer >
            <App/>
            </NavigationContainer>
        </AuthContextProvider>
    )
}