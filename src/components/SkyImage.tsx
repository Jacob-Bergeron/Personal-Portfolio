import { Image, Flex } from '@mantine/core';

import sky from "../assets/background-sky.jpeg"

const SkyImage = () => {
    return (

        <Flex style={{ width: '100%', justifyContent: 'center', paddingTop: '8vh', paddingBottom: '8vh' }} >
            <Image className='background-image' src={sky} />
        </Flex>
        
    );
}
export default SkyImage;