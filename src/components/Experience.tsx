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
                        - Analyzed high-volume data from measuring systems that generated over <b>5,000 entries</b> per hour to monitor and optimize the process flow of electronic parts.
                    </Text>
                    <Text className='bullet-point'>
                        - Leveraged SQL and Tableau to efficiently clean, transform, and visualize large datasets extracted from Oracle databases for operational analysis.
                    </Text>
                    <Text className='bullet-point' >
                        - Conducted statistical analysis using Python and JMP to extract actionable insights and identify performance trends within the high-frequency data
                    </Text>
                    <Text className='bullet-point' >
                        - Developed and presented a data-driven action plan to reduce wafer hold rates by <b>25%</b>.
                    </Text>
                </Container>
            </Stack>
        </Flex>
    </Box>
);
export default Experience;