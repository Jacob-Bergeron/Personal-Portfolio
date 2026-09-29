import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text, Flex, List } from '@mantine/core';
import "../styles/Project.css";
const Project = ({ title, points }) => {
    return (_jsx(Box, { className: 'project-card', children: _jsx(Flex, { justify: "start", align: "center", children: _jsxs(Box, { className: 'project-description', style: { flex: 1 }, children: [_jsx(Text, { size: "xl", fw: 700, mb: "sm", children: title }), _jsx(List, { className: "bullet-point", pl: "pl", spacing: "xs", size: "xs", mt: "sm", children: points.map((point, index) => (_jsx(List.Item, { style: { paddingTop: '0.5rem' }, children: point }, index))) })] }) }) }));
};
export default Project;
