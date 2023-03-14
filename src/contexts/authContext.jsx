import { createContext, useState } from "react";

export const AuthContext = createContext()

export default function AuthContextProvider({children}){
    const [user,setUser] = useState()

    const authContextData={user,setUser}
    return<AuthContext.Provider value={authContextData}>
        {children}
    </AuthContext.Provider>
}