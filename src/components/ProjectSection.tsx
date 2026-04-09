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
                    title="Terrazzo - Full-Stack Web App"
                    points={[
                        'Collaborated on a 10-person team to develop a Trello-style full-stack application using TypeScript, React, and WebSockets.',
                        'Contributed to front-end feature implementation using Mantine UI components, focusing on user interface responsiveness and interactivity.',
                        'Participated in agile development using stand-up meetings and storyboards to coordinate and track progress.',
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