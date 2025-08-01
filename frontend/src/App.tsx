import { useEffect, useState } from 'react';

function App() {
  const [msg, setMsg] = useState('Loading…');

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMsg(data.message))
      .catch(() => setMsg('Error fetching message'));
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">{msg}</h1>
    </div>
  );
}

export default App;
