import { Box, Flex, Container, Title } from '@mantine/core';
import Project from './Project';

const ProjectSection = () => (
    <Box id='project-section' className='box-section' data-aos="fade-up">

        {/* Title */}
        <Flex align="center">
            <Title order={1}>Projects</Title>
        </Flex>

        <Container>
            <Flex gap="md" direction="column" >
                <Project
                    title="Mind in the Machine - LLM Research"
                    points={[
                        'Designed a 200 sample dataset to evaluate LLM Theory of Mind capabilities through reasoning questions.',
                        'Integrated OpenAI / Anthropic / Gemini APIs.',
                        'Analyzed LLM responses to identify patterns and evaluate performance metrics.',
                    ]}
                />
                <Project
                    title="Tables4u - Project Management Full-Stack Web App"
                    points={[
                        'Developed a full-stack OpenTable-inspired reservation application in a 5-week sprint, deploying on Amazon Web Services.',
                        'Designed a front-end webpage and resources using ReactJS. ',
                        'Utilized MySQL to host backend database information and to structure queries.',
                        'Coded JavaScript lambda functions and used REST API to connect front-end with relational database'
                    ]}
                />
                
            </Flex>
        </Container>

    </Box>
);

export default ProjectSection; 