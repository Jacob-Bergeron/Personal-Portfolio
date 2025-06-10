import { Title, Text, Stack, Flex, Box, Container } from '@mantine/core';

const Experience = () => (
    <Box id='experience'
        className='box-section'

    >

        <Flex >
            <Stack align="center" my="xl" >
                {/* Title */}
                <Flex justify="start" >
                    <Title order={1}>Experience</Title>
                </Flex>

                {/* Experiences */}
                <Container>
                    <Title order={2} style={{marginBottom: "0"}}>Data Science Intern</Title>
                    <Title order={4} style={{marginTop: "0"}} >June 2024 - Aug 2024</Title>
                    <Text className='bullet-point' >
                        - Utilized SQL and Tableau to clean, filter, and arrange data from Oracle databases.
                    </Text>
                    <Text className='bullet-point'>
                        - Derived actionable insight using Python and statistical analysis software JMP.
                    </Text>
                    <Text className='bullet-point' >
                        - Proposed a plan of action to reduce the overall error rate by 25% based on analysis. 
                    </Text>
                </Container>
            </Stack>
        </Flex>
    </Box>
);
export default Experience;