import { Title, Text, Stack, Flex, Box, Container } from '@mantine/core';

const Experience = () => (
    <Box
        style={{
            paddingTop: '2rem',
            paddingBottom: '6rem',
        }}
    >

        <Flex justify="center" >
            <Stack align="center" my="xl">
                {/* Title */}
                <Flex justify="start" >
                    <Title order={1}>Experience</Title>
                </Flex>

                {/* Experiences */}
                <Container>
                    <Title order={2} mb="md">Data Science Intern</Title>
                    <Title order={4} mb="md">June-Aug 2024</Title>
                    <Text size="lg" >
                        - Utilized SQL and Tableau to clean, filter, and arrange data from Oracle databases.
                    </Text>
                    <Text size="lg" >
                        - Derived actionable insight using Python and statistical analysis software JMP.
                    </Text>
                    <Text size="lg" >
                        - Proposed a plan of action to reduce the overall error rate by 25% based on analysis. 
                    </Text>
                </Container>
            </Stack>
        </Flex>
    </Box>
);
export default Experience;