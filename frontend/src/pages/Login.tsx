import { useContext, useState } from 'react'
import { AuthContext } from '../contexts/Auth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { setToken } = useContext(AuthContext)
  const nav = useNavigate()
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('')

  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth/login', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) return alert('Login failed')
    const { accessToken } = await res.json()
    setToken(accessToken)
    nav('/')
  }

  return (
    <form onSubmit={submit} className="m-auto mt-20 flex w-80 flex-col gap-4">
      <input  className="border p-2" placeholder="email"    value={email}    onChange={e=>setEmail(e.target.value)} />
      <input  className="border p-2" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} type="password"/>
      <button className="bg-blue-600 text-white p-2">Login</button>
    </form>
  )
}
