import { Image, Flex, Text } from '@mantine/core';

import sky from "../assets/background-sky.jpeg"

const SkyImage = () => {
    return (

        <Flex data-aos="fade-up" style={{ width: '100%', justifyContent: 'center', paddingTop: '4vh' }} >
            <div className='sky-image-wrapper'>
                <Image className='background-image' src={sky} alt='Night sky landscape' />
                <Text className='sky-image-caption'>Photo by me, somewhere in New Hampshire</Text>
            </div>
        </Flex>
        
    );
}
export default SkyImage;