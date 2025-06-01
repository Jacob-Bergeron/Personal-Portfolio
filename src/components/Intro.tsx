import { Title, Text, Button, Stack } from '@mantine/core';

const Intro = () => (
  <Stack align="center"  my="xl" >
    <Title order={1}>Hey, I'm Jacob Bergeron</Title>
    <Text size="lg" >
      Undergraduate Computer Science student at Worcester Polytechnic Institute.
    </Text>
    <Button component="a" href="#projects" color="indigo">
      See my work
    </Button>
  </Stack>
);

export default Intro;