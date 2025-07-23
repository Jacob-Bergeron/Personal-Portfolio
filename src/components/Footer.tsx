import { Text, Container, Flex, Box } from '@mantine/core';

const Footer = () => {
    return (
        <Box style={{
            paddingTop: '8vh',
        }}
        >
            <Flex gap="0.1px" direction="column" align="center" justify="center">
                <Text style={{marginBottom: '0.2rem', fontSize: '0.8rem', opacity: '0.8'}}>
                    Built and designed by Jacob Bergeron.
                </Text>
                <Text style={{marginTop: '0rem', marginBottom: '3em', fontSize: '0.8rem', opacity: '0.8'}}>
                    All rights reserved. ©
                </Text>
            </Flex>
        </Box>
    );
}
export default Footer;