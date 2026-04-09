import { Box, Text, Flex, List } from '@mantine/core';
import "../styles/Project.css";

interface ProjectProps {
    title: string;
    points: string[];
}

const Project = ({ title, points }: ProjectProps) => {
    return (
        <Box className='project-card'>
            <Flex justify="start" align="center" >
                {/*  */}
                <Box className='project-description' style={{ flex: 1 }} >
                    <Text size="xl" fw={700} mb="sm">
                        {title}
                    </Text>

                    {/* Bullet Points */}
                    <List className="bullet-point" pl="pl" spacing="xs" size="xs" mt="sm">
                        {points.map((point, index) => (
                            <List.Item key={index} style={{paddingTop: '0.5rem'}}>{point}</List.Item>
                        ))}
                    </List>
                </Box>
            </Flex>
        </Box>
    );
};

export default Project;
