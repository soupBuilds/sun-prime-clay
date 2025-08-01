import { createContext, useState, useEffect } from 'react'

interface AuthCtx { token: string|null; setToken: (t:string|null)=>void }
export const AuthContext = createContext<AuthCtx>({ token:null, setToken:()=>{} })

export const AuthProvider = ({ children }: { children: React.ReactNode}) => {
  const [token, setToken] = useState<string|null>(() => localStorage.getItem('access') )

  useEffect(() => {
    if (token) localStorage.setItem('access', token)
    else       localStorage.removeItem('access')
  }, [token])

  return <AuthContext.Provider value={{ token, setToken }}>{children}</AuthContext.Provider>
}
