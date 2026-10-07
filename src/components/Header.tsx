import { Box, Flex, Text, Button } from '@mantine/core';
import '../styles/Header.css';

const CONTACT_EMAIL =
  import.meta.env.VITE_CONTACT_EMAIL ?? 'jbergeron952@gmail.com';

const contactMailto = `mailto:${CONTACT_EMAIL}`;

const Header = () => (
  <Box className='header-section'>

    <Flex justify="start" align="center" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
      <Text fw={700} component="a" href={import.meta.env.BASE_URL} className="header-home">
        JB
      </Text>

      <Flex justify="" align="center" gap="lg" ml="auto" wrap="wrap">
        <a href="#experience">
          <Button className='header-button'>Experience</Button>
        </a>
        <a href="#project-section">
          <Button className='header-button'>Projects</Button>
        </a>
        <a href="https://github.com/jacob-bergeron" target="_blank" rel="noopener noreferrer">
          <Button className='header-button'>Github</Button>
        </a>
        <a href={contactMailto}>
          <Button className='header-button'>Contact</Button>
        </a>
      </Flex>
    </Flex>
  </Box>
);

export default Header;
