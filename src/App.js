import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import EscapeRoomPage from './pages/EscapeRoomPage';
import "./styles/Global.css";
import "./App.css";
import AOS from 'aos';
import 'aos/dist/aos.css';
function App() {
    useEffect(() => {
        AOS.init({
            duration: 1800,
            once: true,
            offset: 100,
        });
    }, []);
    return (_jsxs(MantineProvider, { children: [_jsx(Header, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/escape-room", element: _jsx(EscapeRoomPage, {}) }), _jsx(Route, { path: "/3d-room", element: _jsx(Navigate, { to: "/escape-room", replace: true }) }), _jsx(Route, { path: "/icosahedron", element: _jsx(Navigate, { to: "/escape-room", replace: true }) })] })] }));
}
export default App;
