import { Title, Text, Stack, Flex, Box, Container } from '@mantine/core';

const Experience = () => (
    <Box id='experience'
        className='box-section'
        data-aos="fade-up"
    >

        <Flex >
            <Stack align="center" my="xl" >
                {/* Title */}
                <Flex justify="start" >
                    <Title order={1}>Experience</Title>
                </Flex>

                {/* Experiences */}
                <Container>
                    <Title order={2} style={{marginBottom: "0"}}>Software Engineering Intern @ RTX</Title>
                    <Title order={4} style={{marginTop: "0"}} >June 2025 - May 2026</Title>
                    <Text className='bullet-point' >
                        - Reduced manual deployment time of a 15-year-old legacy infrastructure by 40% with Python automation and JFrog Artifactory.
                    </Text>
                    <Text className='bullet-point'>
                        - Developed a modular codebase to replace 13 independent systems, reducing redundant development efforts by 10x - 13x.
                    </Text>
                    <Text className='bullet-point' >
                        - Rebuilt a Python GUI from scratch to replace a legacy interface, achieving functionality across 90% of features.
                    </Text>
                </Container>
                <Container>
                    <Title order={2} style={{marginBottom: "0"}}>Front-End Developer @ Mosaiq</Title>
                    <Title order={4} style={{marginTop: "0"}} >June 2025 - May 2026</Title>
                    <Text className='bullet-point' >
                        - Collaborated on a 10-person team to develop a Trello-style full-stack app using TypeScript and WebSockets.
                    </Text>
                    <Text className='bullet-point'>
                        - Built front-end features with React, focusing on user interface responsiveness and interactivity.
                    </Text>
                </Container>
                <Container>
                    <Title order={2} style={{marginBottom: "0"}}>Data Science Intern @ RTX</Title>
                    <Title order={4} style={{marginTop: "0"}} >June 2024 - Aug 2024</Title>
                    <Text className='bullet-point' >
                        - Analyzed high-throughput measurement data exceeding 5,000 entries per hour from RF and semiconductor fabrication systems. 
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