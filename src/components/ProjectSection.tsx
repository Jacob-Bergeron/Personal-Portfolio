import { Box, Flex, Text, Container, Title } from '@mantine/core';
import Project from './Project';

const ProjectSection = () => (
    <Box id='project-section' className='box-section' >

        {/* Title */}
        <Flex align="center">
            <Title order={1}>Projects</Title>
        </Flex>

        <Container>
            <Flex gap="md" direction="column" >
                <Project
                    title="Tables4u"
                    points={[
                        'Developed an OpenTable application mimic in 5 weeks, backed by Amazon Web Services.',
                        'Designed a front-end webpage and resources using ReactJS. ',
                        'Utilized MySQL to host backend database information and to structure queries.',
                        'Coded JavaScript lambda functions and used REST API to connect front-end with relational database.'
                    ]}
                    image="https://via.placeholder.com/150"
                />
                <Project
                    title="Sustainable Manufacturing in Panama"
                    points={[
                        'Conducted market research to gain insights into Panamanian sentiments toward sustainable products.',
                        'Analyzed market data related to sustainable manufacturing in Panama and the US with Python',
                        'Created a plan of action for Simple AF to help them grow in the domestic and international markets',
                    ]}
                    image="https://via.placeholder.com/150"
                />
            </Flex>
        </Container>

    </Box>
);

export default ProjectSection; 