import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import CreateRoomButton from './components/CreateRoomButton';


function App() {
  
  return (
    <div className="flex justify-center items-center w-screen h-screen">
      <CreateRoomButton />
    </div>
  );
}

export default App;
