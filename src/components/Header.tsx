import { Box, Flex, Text, Button } from '@mantine/core';

const Header = () => (
  <Box

    style={{
      backgroundColor: '#7d4f50',
      color: 'white',
      width: '100%',
      position: 'fixed',
      top: 0,
    }}
  >
    <Flex justify="start" align="center" style={{ paddingLeft: '2rem' }}>
      <Text fw={700}>JB</Text>

      <Flex justify="" align="center" gap="lg" ml="auto">
        <Button>Experience</Button>
        <Button>Projects</Button>
        <a href="https://github.com/jacob-bergeron" target="_blank">
          <Button>Github</Button>
        </a>
        <Button>Contact</Button>
      </Flex>
    </Flex>
  </Box>
);

export default Header;


