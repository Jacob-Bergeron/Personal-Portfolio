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

function App() {
  return (
    <MantineProvider>
      <Header />
      <Intro />
      <About />
      <SkyImage />
      <Experience />
      <ProjectSection />
      <Footer />
    </MantineProvider>
  );
}

export default App;


