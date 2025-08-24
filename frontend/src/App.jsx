// import { useState } from 'react'

import './App.css'
import Home from './Components/Home'
import LandingPage from './Components/LandingPage'
import {BrowserRouter,Routes,Route} from 'react-router-dom'

function App() {
  

  return (
    <BrowserRouter>
    
      <Routes>
        <Route exact path="/" element={<LandingPage/>}/>
        <Route exact path="/Home" element={<Home/>}/>
      </Routes>
    
    </BrowserRouter>
  )
}

export default App