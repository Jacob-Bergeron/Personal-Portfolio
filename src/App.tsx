import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ThreeDRoomPage from './pages/3DRoomPage';

import "./styles/Global.css";
import "./App.css"

import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1800,
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <MantineProvider>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/3d-room" element={<ThreeDRoomPage />} />
        <Route path="/icosahedron" element={<Navigate to="/3d-room" replace />} />
      </Routes>
    </MantineProvider>
  );
}

export default App;
