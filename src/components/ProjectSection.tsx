import { Box, Flex, Text, Container, Title } from '@mantine/core';
import Project from './Project';

const ProjectSection = () => (
    <Box
        p="md"
        style={{
            backgroundColor: '#f0f0f0',
            color: 'black',
            paddingTop: '2rem',
            paddingLeft: '10rem',
        }}
    >

        {/* Title */}
        <Flex align="center" style={{ paddingBottom: '0.5rem' }}>
            <Title order={1}>Projects</Title>
        </Flex>

        <Container>
            <Flex gap="md" direction="column" >
                <Project
                    title="Project 1"
                    points={['Bullet point 1',
                        'Bullet point 2',
                        'Bullet point 3',
                        'Bullet point 4'
                    ]}
                    image="https://via.placeholder.com/150"
                />
                <Project
                    title="Project 2"
                    points={['Bullet point 1',
                        'Bullet point 2',
                        'Bullet point 3',
                        'Bullet point 4'
                    ]}
                    image="https://via.placeholder.com/150"
                />
            </Flex>
        </Container>

    </Box>
);

export default ProjectSection; 