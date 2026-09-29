import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Flex, Container, Title } from '@mantine/core';
import Project from './Project';
const ProjectSection = () => (_jsxs(Box, { id: 'project-section', className: 'box-section', "data-aos": "fade-up", children: [_jsx(Flex, { align: "center", children: _jsx(Title, { order: 1, children: "Projects" }) }), _jsx(Container, { children: _jsxs(Flex, { gap: "md", direction: "column", children: [_jsx(Project, { title: "", points: [] }), _jsx(Project, { title: "Mind in the Machine - LLM Research", points: [
                            'Designed a 200 sample dataset to evaluate LLM Theory of Mind capabilities through reasoning questions.',
                            'Integrated OpenAI / Anthropic / Gemini APIs.',
                            'Analyzed LLM responses to identify patterns and evaluate performance metrics.',
                        ] }), _jsx(Project, { title: "Tables4u - Project Management Full-Stack Web App", points: [
                            'Developed a full-stack OpenTable-inspired reservation application in a 5-week sprint, deploying on Amazon Web Services.',
                            'Designed a front-end webpage and resources using ReactJS. ',
                            'Utilized MySQL to host backend database information and to structure queries.',
                            'Coded JavaScript lambda functions and used REST API to connect front-end with relational database'
                        ] })] }) })] }));
export default ProjectSection;
