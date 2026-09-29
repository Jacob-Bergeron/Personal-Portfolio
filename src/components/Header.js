import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Flex, Text, Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import '../styles/Header.css';
const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? 'jbergeron952@gmail.com';
const contactMailto = `mailto:${CONTACT_EMAIL}`;
const Header = () => (_jsx(Box, { className: 'header-section', children: _jsxs(Flex, { justify: "start", align: "center", style: { paddingLeft: '2rem', paddingRight: '2rem' }, children: [_jsx(Text, { fw: 700, component: Link, to: "/", className: "header-home", children: "JB" }), _jsxs(Flex, { justify: "", align: "center", gap: "lg", ml: "auto", wrap: "wrap", children: [_jsx(Link, { to: "/#experience", children: _jsx(Button, { className: 'header-button', children: "Experience" }) }), _jsx(Link, { to: "/#project-section", children: _jsx(Button, { className: 'header-button', children: "Projects" }) }), _jsx(Link, { to: "/escape-room", children: _jsx(Button, { className: 'header-button', children: "Escape Room" }) }), _jsx("a", { href: "https://github.com/jacob-bergeron", target: "_blank", rel: "noopener noreferrer", children: _jsx(Button, { className: 'header-button', children: "Github" }) }), _jsx("a", { href: contactMailto, children: _jsx(Button, { className: 'header-button', children: "Contact" }) })] })] }) }));
export default Header;
