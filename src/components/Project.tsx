import { Box, Text, Image, Flex, List } from '@mantine/core';
import "../styles/Project.css"; 

interface ProjectProps {
  title: string;
  points: string[];
  image: string;
}

const Project = ({ title, points, image }: ProjectProps) => {
  return (
    <Box className='project-card'
        style ={{
            
        }}
    >
      <Flex justify="start" align="center" gap="md" >
        {/* Text content */}
        <Box className='project-description' style={{ flex: 1 }}>
          <Text size="xl" fw={700} mb="sm">
            {title}
          </Text>

          <List spacing="xs" size="sm" mt="sm">
            {points.map((point, index) => (
              <List.Item key={index}>{point}</List.Item>
            ))
            }
          </List>

        </Box>

        {/* Image */}
        <Image
          src={image}
          alt={title}
          width={150}
          height={100}
          radius="md"
          style={{ objectFit: 'cover' }}
        />
      </Flex>
    </Box>
  );
};

export default Project;
