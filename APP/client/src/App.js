import React from 'react';
import './App.css';
import { StoreProvider } from './Store';
import WindowManager from './components/WindowManagerComponent';

function App() {
  
  return (
    <StoreProvider>
      <WindowManager />
    </StoreProvider>
  );
}

export default App;