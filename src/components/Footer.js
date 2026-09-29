import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, Flex, Box } from '@mantine/core';
const Footer = () => {
    return (_jsx(Box, { "data-aos": "fade-up", style: {
            paddingTop: '8vh',
        }, children: _jsxs(Flex, { gap: "0.1px", direction: "column", align: "center", justify: "center", children: [_jsx(Text, { style: { marginBottom: '0.2rem', fontSize: '0.8rem', opacity: '0.8' }, children: "Built and designed by Jacob Bergeron." }), _jsx(Text, { style: { marginTop: '0rem', marginBottom: '3em', fontSize: '0.8rem', opacity: '0.8' }, children: "All rights reserved. \u00A9" })] }) }));
};
export default Footer;
