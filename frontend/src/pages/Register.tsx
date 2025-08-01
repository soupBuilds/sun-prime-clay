/*  src/pages/Register.tsx  */
import { useContext, useState } from 'react'
import { AuthContext } from '../contexts/Auth'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const { setToken } = useContext(AuthContext)
  const nav          = useNavigate()

  /* ---------- local form state ---------- */
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [busy,    setBusy]    = useState(false)

  /* ---------- handlers ---------- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password: pass }),
      })

      if (!res.ok) {
        const { msg } = await res.json()
        alert(msg ?? 'Registration failed')
        return
      }

      const { accessToken } = await res.json()
      setToken(accessToken)   // stored in AuthContext + localStorage
      nav('/')                // go to dashboard (home)
    } finally {
      setBusy(false)
    }
  }

  /* ---------- UI ---------- */
  return (
    <form onSubmit={submit} className="m-auto mt-20 flex w-80 flex-col gap-4">
      <input
        className="border p-2"
        placeholder="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="border p-2"
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
      />
      <input
        className="border p-2"
        placeholder="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        required
        type="password"
      />
      <button
        className="bg-green-600 text-white p-2 disabled:opacity-50"
        disabled={busy}
      >
        {busy ? 'Registering…' : 'Register'}
      </button>
    </form>
  )
}
