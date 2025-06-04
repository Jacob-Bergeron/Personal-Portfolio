import { Title, Text, Stack, Flex, Box } from '@mantine/core';

const Intro = () => (
    <Box
        style={{
            paddingTop: '2rem',
            paddingBottom: '8rem',
        }}
    >
        
        <Flex justify="center">
            <Stack align="center" my="xl" >
                <Flex justify="center">
                    <Title order={1}>Hi, I'm <b>Jacob</b></Title>
                </Flex>
                <Text size="lg" >
                    Currently, I am an undergraduate Computer Science student at Worcester Polytechnic Institute.
                </Text>
            </Stack>
        </Flex>
    </Box>
);

export default Intro;