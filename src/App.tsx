import { useEffect } from 'react';
import { MantineProvider, Image, Flex, Text } from '@mantine/core';
import Header from './components/Header';
import Intro from './components/Intro';
import About from './components/About';
import Experience from './components/Experience';
import ProjectSection from './components/ProjectSection';
import Footer from './components/Footer';
import SkyImage from './components/SkyImage';

import "./styles/Global.css";
import "./App.css"

import AOS from 'aos';
import 'aos/dist/aos.css';
import FadeSection from './components/FadeSection';

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
      <FadeSection>
      <Intro />
      <About />
      <SkyImage />
      <Experience />
      <ProjectSection />
      <Footer />
      </ FadeSection>
    </MantineProvider>
  );
}

export default App;


