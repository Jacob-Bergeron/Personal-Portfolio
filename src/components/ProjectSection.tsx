import { Box, Flex, Text, Button, Container } from '@mantine/core';

const ProjectSection = () => (
  <Box
    component="section"
    p="md"
    style={{
      backgroundColor: '#f0f0f0',
      color: 'black',
      width: '100%',
    }}
  >
    <Flex direction="column" align="center">
      <Text fw={700} size="xl" mb="md">My Projects</Text>
      <Text size="md" mb="lg">
        Here are some of the projects I've worked on recently.
      </Text>
      <Button component="a" href="#projects" color="indigo">
        View Projects
      </Button>
    </Flex>
  </Box>
);

export default ProjectSection;