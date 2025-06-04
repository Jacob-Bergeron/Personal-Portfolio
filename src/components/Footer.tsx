import { Text, Container, Flex, Box } from '@mantine/core';

const Footer = () => {
    return (
        <Box style={{
            paddingTop: '2.5rem',
        }}
        >
            <Flex gap="0.1px" direction="column" align="center" justify="center">
                <Text style={{marginBottom: '0rem'}}>
                    Built and designed by Jacob Bergeron.
                </Text>
                <Text style={{marginTop: '0rem'}}>
                    All rights reserved. ©
                </Text>
            </Flex>
        </Box>
    );
}
export default Footer;