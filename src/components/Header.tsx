import { Box, Flex, Text, Button } from '@mantine/core';

const Header = () => (
  <Box
    component="header"
    p="md"
    style={{
      backgroundColor: '#1a1a1a',
      color: 'white',
      width: '100%',
    }}
  >
    <Flex justify="start" align="center" style={{ paddingLeft: '2rem' }}>
      <Text fw={700}>JB</Text>

      <Flex justify="" align="center" gap="lg" ml="auto">
        <Button>About</Button>
        <Button>Projects</Button>
        <Button>Github</Button>
        <Button>Contact</Button>
      </Flex>
    </Flex>
  </Box>
);

export default Header;


