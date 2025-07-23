import { Title, Text, Stack, Flex, Box} from '@mantine/core';


const Intro = () => (
    <Box
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
                    I am an undergraduate Computer Science student at Worcester Polytechnic Institute. 
                    I am passionate about data science, software engineering, and web development.
                </Text>
            </Stack>
            

            
        </Flex>
    </Box>
);

export default Intro;