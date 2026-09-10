import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Intro from '../components/Intro';
import About from '../components/About';
import Experience from '../components/Experience';
import ProjectSection from '../components/ProjectSection';
import Footer from '../components/Footer';
import SkyImage from '../components/SkyImage';
import BlackHole from '../components/BlackHole.tsx';
import GameOfLife from '../components/GameOfLife';

function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView();
  }, [hash]);

  return (
    <>
      <Intro />
      <About />
      <SkyImage />
      <Experience />
      <GameOfLife />
      <ProjectSection />
      <Footer />
      <BlackHole />
    </>
  );
}

export default HomePage;
