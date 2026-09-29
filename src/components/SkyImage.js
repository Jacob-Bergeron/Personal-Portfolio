import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Image, Flex, Text } from '@mantine/core';
import sky from "../assets/background-sky.jpeg";
const SkyImage = () => {
    return (_jsx(Flex, { "data-aos": "fade-up", style: { width: '100%', justifyContent: 'center', paddingTop: '4vh' }, children: _jsxs("div", { className: 'sky-image-wrapper', children: [_jsx(Image, { className: 'background-image', src: sky, alt: 'sky landscape' }), _jsx(Text, { className: 'sky-image-caption', children: "Photo by me, somewhere in New Hampshire" })] }) }));
};
export default SkyImage;
