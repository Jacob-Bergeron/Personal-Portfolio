import { Title, Text, Stack, Flex, Box} from '@mantine/core';


const Intro = () => (
    
    <Box
        data-aos="fade-up"
        style={{
            paddingTop: '15vh',
            paddingBottom: '4vh',
        }}
    >
        <Flex justify="center">
            <Stack align="center" my="xl" >
                <Flex justify="center">
                    <Title order={1}>Hi, I'm <b>Jacob</b></Title>
                </Flex>
                <Text size="lg" style={{ maxWidth: '40vw', textAlign: 'center' }}>
                I am currently a Software Engineer at RTX. Recently, I've been interested in experimenting with WebGPU and WebXR to build immersive experiences on the web.
                Outside of work, I enjoy being outdoors, reading philosophy and playing video games.
                </Text>
            </Stack>
            
        </Flex>
    </Box>


);

export default Intro;