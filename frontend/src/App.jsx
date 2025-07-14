import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Warranty from './component/Warranty'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Warranty />
    </>
  )
}

export default App
