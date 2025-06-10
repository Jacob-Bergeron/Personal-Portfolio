import { MantineProvider, Container, Image, Flex } from '@mantine/core';
import Header from './components/Header';
import Intro from './components/Intro';
import About from './components/About';
import Experience from './components/Experience';
import ProjectSection from './components/ProjectSection';
import Footer from './components/Footer';

import sky from "./assets/background-sky.jpeg"
import "./styles/Global.css";
import "./App.css"

function App() {
  return (
    <MantineProvider>
      <Header />
      <Intro />
      <About />
      <Flex style={{ width: '100%', justifyContent: 'center', paddingTop: '8vh', paddingBottom: '8vh' }}>
        <Image className='background-image' src={sky} alt="Background" />
      </Flex>
      <Experience />
      <ProjectSection />
      <Footer />
    </MantineProvider>
  );
}

export default App;


