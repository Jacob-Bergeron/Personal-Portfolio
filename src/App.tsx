import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import Header from './components/Header';
import HomePage from './pages/HomePage';

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
        <Route path="/escape-room" element={<Navigate to="/#escape-room" replace />} />
        <Route path="/3d-room" element={<Navigate to="/#escape-room" replace />} />
        <Route path="/icosahedron" element={<Navigate to="/#escape-room" replace />} />
      </Routes>
    </MantineProvider>
  );
}

export default App;
