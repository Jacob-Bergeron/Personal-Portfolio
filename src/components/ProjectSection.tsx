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
                        'Designed a 250 sample dataset to evaluate LLM Theory of Mind capabilities through reasoning questions.',
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
                <Project
                    title="Assessing Simple AF's Position in the Circular Economy - Interactive Qualifying Project "
                    points={[
                        'Designed and distributed a consumer sentiment survey, collecting 200+ responses on sustainability in Panama.',
                        'Analyzed survey and market data using Python to identify sustainable manufacturing trends and growth opportunities.',
                        'Developed a strategic plan for Simple AF to expand market presence based on research-driven insights.',
                    ]}
                />
            </Flex>
        </Container>

    </Box>
);

export default ProjectSection; 