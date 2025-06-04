import { MantineProvider, Container, Space } from '@mantine/core';
import Header from './components/Header';
import Intro from './components/Intro';
import Experience from './components/Experience';
import ProjectSection from './components/ProjectSection';
import Footer from './components/Footer';

function App() {
  return (
    <MantineProvider>
      <Header />
      <Intro />
      <Experience />
      <ProjectSection />
      <Footer />
    </MantineProvider>
  );
}

export default App;


