import { Box, Flex, Text, Button } from '@mantine/core';
import '../styles/Header.css';

const Header = () => (
  <Box className='header-section'>

    <Flex justify="start" align="center" style={{ paddingLeft: '2rem' }}>
      <Text fw={700}>JB</Text>

      <Flex justify="" align="center" gap="lg" ml="auto">
        <a href='#experience'>
          <Button className='header-button' >Experience</Button>
        </a>
        <a href='#project-section'>
        <Button className='header-button' >Projects</Button>
        </a>
        <a href="https://github.com/jacob-bergeron" target="_blank">
          <Button className='header-button' >Github</Button>
        </a>
        <Button className='header-button' >Contact</Button>
      </Flex>
    </Flex>
  </Box>
);

export default Header;


