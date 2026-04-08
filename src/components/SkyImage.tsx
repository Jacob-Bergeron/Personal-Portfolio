import { Image, Flex, Text } from '@mantine/core';

import sky from "../assets/background-sky.jpeg"

const SkyImage = () => {
    return (

        <Flex style={{ width: '100%', justifyContent: 'center', paddingTop: '8vh', paddingBottom: '8vh' }} >
            <div className='sky-image-wrapper'>
                <Image className='background-image' src={sky} alt='Night sky landscape' />
                <Text className='sky-image-caption'>Taken in New Hampshire, USA</Text>
            </div>
        </Flex>
        
    );
}
export default SkyImage;