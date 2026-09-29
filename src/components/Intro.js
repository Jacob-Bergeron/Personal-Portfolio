import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Title, Text, Stack, Flex, Box } from '@mantine/core';
const Intro = () => (_jsx(Box, { "data-aos": "fade-up", style: {
        paddingTop: '15vh',
        paddingBottom: '4vh',
    }, children: _jsx(Flex, { justify: "center", children: _jsxs(Stack, { align: "center", my: "xl", children: [_jsx(Flex, { justify: "center", children: _jsxs(Title, { order: 1, children: ["Hi, I'm ", _jsx("b", { children: "Jacob" })] }) }), _jsx(Text, { size: "lg", style: { maxWidth: '40vw', textAlign: 'center' }, children: "I am an undergraduate Computer and Data Science student at Worcester Polytechnic Institute." })] }) }) }));
export default Intro;
