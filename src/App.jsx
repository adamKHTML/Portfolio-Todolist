import * as React from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './Homepage';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import TaskForm from './components/TaskForm';

function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Formulaire" element={<TaskForm />} />

      </Routes>

    </Router>
  )
}

export default App