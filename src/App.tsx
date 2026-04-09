import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import Header from './components/Header';
import Intro from './components/Intro';
import About from './components/About';
import Experience from './components/Experience';
import ProjectSection from './components/ProjectSection';
import Footer from './components/Footer';
import SkyImage from './components/SkyImage';
import BlackHole from './components/BlackHole.tsx';
import GameOfLife from './components/GameOfLife';

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
    <MantineProvider >
      <Header />
      <Intro />
      <About />
      <SkyImage />
      <Experience />
      <GameOfLife />
      <ProjectSection />
      <Footer />
      <BlackHole />
    </MantineProvider>
  );
}

export default App;


