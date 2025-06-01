import { MantineProvider, Container } from '@mantine/core';
import Header from './components/header';
import Intro from './components/Intro';
import ProjectSection from './components/ProjectSection';

function App() {
  return (
    <MantineProvider>
      <Header />
      <Intro />
      <ProjectSection />
    </MantineProvider>
  );
}

export default App;


