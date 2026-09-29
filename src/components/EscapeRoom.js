import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Group, Title } from '@mantine/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import '../styles/EscapeRoom.css';
const ROOM_W = 8;
const ROOM_H = 4;
const ROOM_D = 8;
const ICO_RADIUS = 0.55;
const IDLE_Y = 0.004;
const LAMP_COLORS = [0xf2d895, 0xff1a1a, 0x1a6aff, 0xffffff];
const LAMP_YELLOW = LAMP_COLORS[0];
const LAMP_RED = LAMP_COLORS[1];
const LAMP_BLUE = LAMP_COLORS[2];
const DIGIT_FADE = 0.12;
const DOOR_H = ROOM_H * 0.8;
const DOOR_W = DOOR_H * 0.45;
const DOOR_T = 0.08;
const PANEL_W = 0.34;
const PANEL_H = 0.52;
const PANEL_T = 0.045;
const WALL_DIGITS = [
    { digit: '1', tint: 0xff3b3b, x: -2.15, lamp: LAMP_RED },
    { digit: '2', tint: 0xf5d78a, x: 0, lamp: LAMP_YELLOW },
    { digit: '3', tint: 0x4a8cff, x: 2.15, lamp: LAMP_BLUE },
];
function wallDigit(digit, tint, x) {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not create digit canvas');
    }
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 380px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit, size / 2, size / 2 + 16);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(1.45, 1.85);
    const mat = new THREE.MeshBasicMaterial({
        map: tex,
        color: tint,
        transparent: true,
        opacity: 0,
        depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, ROOM_H / 2 + 0.08, -ROOM_D / 2 + 0.02);
    return { mesh, geo, mat, tex };
}
// Create a plane helper function
function plane(w, h, color) {
    const geo = new THREE.PlaneGeometry(w, h);
    const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.88,
        metalness: 0.04,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    return { mesh, geo, mat };
}
function box(w, h, d, color) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.72,
        metalness: 0.08,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return { mesh, geo, mat };
}
// Main component
function EscapeRoom() {
    const rootRef = useRef(null);
    const canvasRef = useRef(null);
    const materialRef = useRef(null);
    const controlsRef = useRef(null);
    const panelOpenRef = useRef(false);
    const openPanelRef = useRef(() => { });
    const closeButtonRef = useRef(null);
    const [wireframe, setWireframe] = useState(true);
    const [panelOpen, setPanelOpen] = useState(false);
    const [codes, setCodes] = useState(['', '', '']);
    openPanelRef.current = () => {
        if (controlsRef.current)
            controlsRef.current.enabled = false;
        setPanelOpen(true);
    };
    useEffect(() => {
        panelOpenRef.current = panelOpen;
        if (controlsRef.current)
            controlsRef.current.enabled = !panelOpen;
        if (!panelOpen)
            return;
        closeButtonRef.current?.focus();
        const onKey = (e) => {
            if (e.key === 'Escape')
                setPanelOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [panelOpen]);
    useEffect(() => {
        const root = rootRef.current;
        const canvas = canvasRef.current;
        if (!root || !canvas)
            return;
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false,
        });
        renderer.setClearColor(0x0c0c0f, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 50);
        camera.position.set(0, 1.6, 2.6);
        const toDispose = [];
        const toDisposeMat = [];
        const toDisposeTex = [];
        // Create the walls, floor and ceiling
        const floor = plane(ROOM_W, ROOM_D, 0xd4c19a);
        floor.mesh.rotation.x = -Math.PI / 2;
        floor.mesh.position.y = 0;
        const ceiling = plane(ROOM_W, ROOM_D, 0xf3e6cc);
        ceiling.mesh.rotation.x = Math.PI / 2;
        ceiling.mesh.position.y = ROOM_H;
        const back = plane(ROOM_W, ROOM_H, 0xe6d5b8);
        back.mesh.position.set(0, ROOM_H / 2, -ROOM_D / 2);
        const front = plane(ROOM_W, ROOM_H, 0xe6d5b8);
        front.mesh.rotation.y = Math.PI;
        front.mesh.position.set(0, ROOM_H / 2, ROOM_D / 2);
        const left = plane(ROOM_D, ROOM_H, 0xe0cdb0);
        left.mesh.rotation.y = Math.PI / 2;
        left.mesh.position.set(-ROOM_W / 2, ROOM_H / 2, 0);
        const right = plane(ROOM_D, ROOM_H, 0xe0cdb0);
        right.mesh.rotation.y = -Math.PI / 2;
        right.mesh.position.set(ROOM_W / 2, ROOM_H / 2, 0);
        const walls = [floor, ceiling, back, front, left, right];
        for (const wall of walls) {
            scene.add(wall.mesh);
            toDispose.push(wall.geo);
            toDisposeMat.push(wall.mat);
        }
        // Door on the front wall. Facing it from inside the room, viewer's right is -X.
        const door = box(DOOR_W, DOOR_H, DOOR_T, 0x5c4636);
        const doorZ = ROOM_D / 2 - DOOR_T / 2 - 0.02;
        door.mesh.position.set(0, DOOR_H / 2, doorZ);
        const panel = box(PANEL_W, PANEL_H, PANEL_T, 0x8d939a);
        const panelX = -(DOOR_W / 2 - PANEL_W / 2 - 0.1);
        panel.mesh.position.set(panelX, DOOR_H / 2, doorZ - DOOR_T / 2 - PANEL_T / 2);
        for (const piece of [door, panel]) {
            scene.add(piece.mesh);
            toDispose.push(piece.geo);
            toDisposeMat.push(piece.mat);
        }
        const place = (piece, x, y, z) => {
            piece.mesh.position.set(x, y, z);
            scene.add(piece.mesh);
            toDispose.push(piece.geo);
            toDisposeMat.push(piece.mat);
            return piece;
        };
        const rug = plane(2.4, 2.4, 0xb89a72);
        rug.mesh.rotation.x = -Math.PI / 2;
        place(rug, 0, 0.012, 0);
        const baseH = 0.08;
        const baseT = 0.04;
        const baseY = baseH / 2;
        const trim = 0x5c4636;
        place(box(ROOM_W, baseH, baseT, trim), 0, baseY, -ROOM_D / 2 + baseT / 2);
        const frontSpan = ROOM_W / 2 - DOOR_W / 2;
        const frontCenter = ROOM_W / 4 + DOOR_W / 4;
        const frontZ = ROOM_D / 2 - baseT / 2;
        place(box(frontSpan, baseH, baseT, trim), -frontCenter, baseY, frontZ);
        place(box(frontSpan, baseH, baseT, trim), frontCenter, baseY, frontZ);
        const sideLen = ROOM_D - baseT * 2;
        place(box(baseT, baseH, sideLen, trim), -ROOM_W / 2 + baseT / 2, baseY, 0);
        place(box(baseT, baseH, sideLen, trim), ROOM_W / 2 - baseT / 2, baseY, 0);
        const caseD = 0.35;
        const caseW = 1.6;
        const caseH = 2.2;
        const board = 0.04;
        const caseZ = -1.6;
        const shelving = new THREE.Group();
        const shelfAnchor = new THREE.Vector3(-ROOM_W / 2 + baseT, 0, caseZ);
        shelving.position.copy(shelfAnchor);
        shelving.scale.setScalar((ROOM_H * 0.9) / caseH);
        scene.add(shelving);
        const placeOnShelf = (piece, x, y, z) => {
            piece.mesh.position.set(x - shelfAnchor.x, y - shelfAnchor.y, z - shelfAnchor.z);
            shelving.add(piece.mesh);
            toDispose.push(piece.geo);
            toDisposeMat.push(piece.mat);
        };
        const caseX = shelfAnchor.x + caseD / 2;
        const bay = (caseH - board * 4) / 3;
        placeOnShelf(box(caseD, caseH, board, trim), caseX, caseH / 2, caseZ - caseW / 2 + board / 2);
        placeOnShelf(box(caseD, caseH, board, trim), caseX, caseH / 2, caseZ + caseW / 2 - board / 2);
        placeOnShelf(box(0.02, caseH, caseW, 0x4a382c), shelfAnchor.x + 0.01, caseH / 2, caseZ);
        const shelfCenters = [
            board / 2,
            board + bay + board / 2,
            board * 2 + bay * 2 + board / 2,
            caseH - board / 2,
        ];
        for (const y of shelfCenters) {
            placeOnShelf(box(caseD - 0.04, board, caseW - board * 2, trim), caseX + 0.015, y, caseZ);
        }
        const bookRows = [
            [
                { h: 0.58, w: 0.08, color: 0xff1a1a },
                { h: 0.62, w: 0.1, color: 0xf2d895 },
                { h: 0.54, w: 0.07, color: 0x1a6aff },
                { h: 0.6, w: 0.09, color: 0x3d4a3a },
                { h: 0.5, w: 0.06, color: 0x6a7a62 },
                { h: 0.57, w: 0.11, color: 0x8a4a3a },
            ],
            [
                { h: 0.48, w: 0.07, color: 0x6a7a62 },
                { h: 0.56, w: 0.12, color: 0xf2d895 },
                { h: 0.52, w: 0.08, color: 0x1a6aff },
                { h: 0.44, w: 0.06, color: 0x8a9a78 },
            ],
            [
                { h: 0.5, w: 0.09, color: 0xff1a1a },
                { h: 0.46, w: 0.07, color: 0x3d4a3a },
                { h: 0.55, w: 0.1, color: 0xf2d895 },
            ],
        ];
        const bookX = -ROOM_W / 2 + baseT + 0.02 + 0.11;
        bookRows.forEach((row, rowIndex) => {
            const shelfTop = shelfCenters[rowIndex] + board / 2;
            let z = caseZ - (caseW - board * 2) / 2 + 0.04;
            for (const book of row) {
                placeOnShelf(box(0.22, book.h, book.w, book.color), bookX, shelfTop + book.h / 2, z + book.w / 2);
                z += book.w + 0.02;
            }
        });
        const shelfTop = ROOM_H * (2 / 3);
        const shelfT = 0.06;
        const shelfD = 0.42;
        const shelfW = 2.5;
        const shelfBack = ROOM_W / 2 - baseT;
        place(box(shelfD, shelfT, shelfW, trim), shelfBack - shelfD / 2, shelfTop - shelfT / 2, 0);
        for (const z of [-0.95, 0.95]) {
            place(box(0.22, 0.2, 0.06, trim), shelfBack - 0.14, shelfTop - shelfT - 0.1, z);
        }
        const potMat = new THREE.MeshStandardMaterial({
            color: 0x3d3426,
            roughness: 0.72,
            metalness: 0.08,
        });
        const leafMats = [
            new THREE.MeshStandardMaterial({ color: 0x4d6b45, roughness: 0.85, metalness: 0.02 }),
            new THREE.MeshStandardMaterial({ color: 0x6a8f5a, roughness: 0.8, metalness: 0.02 }),
            new THREE.MeshStandardMaterial({ color: 0x3d4a3a, roughness: 0.85, metalness: 0.02 }),
        ];
        const plants = [
            { z: -0.72, potH: 0.18, potR: 0.13, leafH: 0.55, leafR: 0.2, leaf: 0 },
            { z: 0, potH: 0.16, potR: 0.12, leafH: 0.4, leafR: 0.18, leaf: 1 },
            { z: 0.72, potH: 0.2, potR: 0.14, leafH: 0.62, leafR: 0.22, leaf: 2 },
        ];
        const plantX = shelfBack - 0.2;
        for (const plant of plants) {
            const potGeo = new THREE.CylinderGeometry(plant.potR * 0.86, plant.potR, plant.potH, 14);
            const pot = new THREE.Mesh(potGeo, potMat);
            pot.position.set(plantX, shelfTop + plant.potH / 2, plant.z);
            pot.castShadow = true;
            pot.receiveShadow = true;
            const leafGeo = new THREE.ConeGeometry(plant.leafR, plant.leafH, 10);
            const leaves = new THREE.Mesh(leafGeo, leafMats[plant.leaf]);
            leaves.position.set(plantX, shelfTop + plant.potH + plant.leafH / 2 - 0.03, plant.z);
            leaves.castShadow = true;
            leaves.receiveShadow = true;
            scene.add(pot, leaves);
            toDispose.push(potGeo, leafGeo);
        }
        toDisposeMat.push(potMat, ...leafMats);
        const chair = new THREE.Group();
        chair.position.set(-3.05, 0, 2.7);
        chair.rotation.y = Math.atan2(3.05, -2.7);
        chair.scale.setScalar(2);
        const seatWood = 0x6b5340;
        const seat = box(0.46, 0.06, 0.46, seatWood);
        seat.mesh.position.set(0, 0.4, 0);
        chair.add(seat.mesh);
        toDispose.push(seat.geo);
        toDisposeMat.push(seat.mat);
        const legOffsets = [
            [-0.18, -0.18],
            [0.18, -0.18],
            [-0.18, 0.18],
            [0.18, 0.18],
        ];
        for (const [lx, lz] of legOffsets) {
            const backLeg = lz < 0;
            const legH = backLeg ? 0.86 : 0.4;
            const leg = box(0.045, legH, 0.045, trim);
            leg.mesh.position.set(lx, legH / 2, lz);
            chair.add(leg.mesh);
            toDispose.push(leg.geo);
            toDisposeMat.push(leg.mat);
        }
        const backrest = box(0.4, 0.28, 0.04, trim);
        backrest.mesh.position.set(0, 0.58, -0.18);
        chair.add(backrest.mesh);
        toDispose.push(backrest.geo);
        toDisposeMat.push(backrest.mat);
        scene.add(chair);
        // Create the icosahedron
        const icoGeo = new THREE.IcosahedronGeometry(ICO_RADIUS, 1);
        const icoMat = new THREE.MeshStandardMaterial({
            color: 0xc7d1c8,
            wireframe: true,
            metalness: 0.15,
            roughness: 0.45,
        });
        materialRef.current = icoMat;
        const ico = new THREE.Mesh(icoGeo, icoMat);
        ico.position.set(0, ICO_RADIUS, 0);
        ico.castShadow = true;
        ico.receiveShadow = true;
        scene.add(ico);
        toDispose.push(icoGeo);
        toDisposeMat.push(icoMat);
        const pedestalGeo = new THREE.BoxGeometry(0.9, 0.18, 0.9);
        const pedestalMat = new THREE.MeshStandardMaterial({
            color: 0x3d3426,
            roughness: 0.7,
            metalness: 0.08,
        });
        const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
        pedestal.position.set(0, 0.09, 0);
        pedestal.castShadow = true;
        pedestal.receiveShadow = true;
        scene.add(pedestal);
        toDispose.push(pedestalGeo);
        toDisposeMat.push(pedestalMat);
        ico.position.y = 0.18 + ICO_RADIUS;
        // Lighting
        const ambient = new THREE.AmbientLight(0xc7d1c8, 0.22);
        const lampY = 2.55;
        const lamp = new THREE.PointLight(LAMP_COLORS[0], 55, 18);
        lamp.position.set(0, lampY, 0);
        lamp.castShadow = true;
        lamp.shadow.mapSize.set(1024, 1024);
        lamp.shadow.camera.near = 0.2;
        lamp.shadow.camera.far = 16;
        scene.add(ambient, lamp);
        const lampFixture = new THREE.Group();
        lampFixture.position.copy(lamp.position);
        const bulbGeo = new THREE.SphereGeometry(0.16, 24, 16);
        const bulbMat = new THREE.MeshStandardMaterial({
            color: LAMP_COLORS[0],
            emissive: LAMP_COLORS[0],
            emissiveIntensity: 1.35,
            roughness: 0.22,
            metalness: 0.04,
        });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.y = -0.08;
        const capGeo = new THREE.CylinderGeometry(0.05, 0.1, 0.12, 16);
        const capMat = new THREE.MeshStandardMaterial({
            color: 0x2a332c,
            roughness: 0.55,
            metalness: 0.2,
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.y = 0.1;
        const cordLen = ROOM_H - lampY;
        const cordGeo = new THREE.CylinderGeometry(0.016, 0.016, cordLen, 8);
        const cord = new THREE.Mesh(cordGeo, capMat);
        cord.position.y = cordLen / 2;
        lampFixture.add(bulb, cap, cord);
        scene.add(lampFixture);
        toDispose.push(bulbGeo, capGeo, cordGeo);
        toDisposeMat.push(bulbMat, capMat);
        const digits = WALL_DIGITS.map((spec) => {
            const made = wallDigit(spec.digit, spec.tint, spec.x);
            scene.add(made.mesh);
            toDispose.push(made.geo);
            toDisposeMat.push(made.mat);
            toDisposeTex.push(made.tex);
            return { mat: made.mat, lamp: spec.lamp, targetOpacity: 0 };
        });
        let lampColorIndex = 0;
        const applyLampColor = (hex) => {
            lamp.color.setHex(hex);
            bulbMat.color.setHex(hex);
            bulbMat.emissive.setHex(hex);
            for (const d of digits) {
                d.targetOpacity = hex === d.lamp ? 1 : 0;
            }
        };
        applyLampColor(LAMP_COLORS[0]);
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const setPointerFromEvent = (e) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        };
        const hitObjects = (e, objects) => {
            setPointerFromEvent(e);
            raycaster.setFromCamera(pointer, camera);
            return raycaster.intersectObjects(objects).length > 0;
        };
        const hitLamp = (e) => hitObjects(e, [bulb, cap]);
        const hitPanel = (e) => hitObjects(e, [panel.mesh]);
        let panelPointer = null;
        const clickSlop = 6;
        const onPointerMove = (e) => {
            if (panelPointer) {
                const dx = e.clientX - panelPointer.x;
                const dy = e.clientY - panelPointer.y;
                if (dx * dx + dy * dy > clickSlop * clickSlop)
                    panelPointer = null;
            }
            if (panelOpenRef.current) {
                canvas.style.cursor = '';
                return;
            }
            canvas.style.cursor = hitLamp(e) || hitPanel(e) ? 'pointer' : 'grab';
        };
        const onPointerDown = (e) => {
            panelPointer = null;
            if (e.button !== 0 || panelOpenRef.current)
                return;
            if (hitLamp(e)) {
                e.stopImmediatePropagation();
                lampColorIndex = (lampColorIndex + 1) % LAMP_COLORS.length;
                applyLampColor(LAMP_COLORS[lampColorIndex] ?? LAMP_COLORS[0]);
                return;
            }
            if (hitPanel(e))
                panelPointer = { x: e.clientX, y: e.clientY };
        };
        const onPointerUp = (e) => {
            if (!panelPointer || e.button !== 0) {
                panelPointer = null;
                return;
            }
            const start = panelPointer;
            panelPointer = null;
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (dx * dx + dy * dy > clickSlop * clickSlop)
                return;
            if (!hitPanel(e))
                return;
            e.stopImmediatePropagation();
            openPanelRef.current();
        };
        const controls = new OrbitControls(camera, canvas);
        controls.target.set(0, 1.15, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.maxPolarAngle = Math.PI * 0.48;
        controls.minDistance = 0.8;
        controls.maxDistance = 5.2;
        // Prevent the camera from moving outside the room
        const inset = 0.35;
        const roomMin = new THREE.Vector3(-ROOM_W / 2 + inset, inset, -ROOM_D / 2 + inset);
        const roomMax = new THREE.Vector3(ROOM_W / 2 - inset, ROOM_H - inset, ROOM_D / 2 - inset);
        const panDelta = new THREE.Vector3();
        const keepInsideRoom = () => {
            panDelta.copy(controls.target);
            controls.target.clamp(roomMin, roomMax);
            panDelta.sub(controls.target);
            camera.position.sub(panDelta);
            camera.position.clamp(roomMin, roomMax);
        };
        controlsRef.current = controls;
        controls.enabled = !panelOpenRef.current;
        controls.update();
        keepInsideRoom();
        let rafId = 0;
        let cancelled = false;
        const setSize = () => {
            const rect = root.getBoundingClientRect();
            const w = Math.max(1, rect.width);
            const h = Math.max(1, rect.height);
            const dpi = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setPixelRatio(dpi);
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        // Update the scene
        const tick = () => {
            if (cancelled)
                return;
            if (document.visibilityState !== 'hidden') {
                ico.rotation.y += IDLE_Y;
                for (const d of digits) {
                    d.mat.opacity += (d.targetOpacity - d.mat.opacity) * DIGIT_FADE;
                }
                controls.update();
                keepInsideRoom();
                renderer.render(scene, camera);
            }
            rafId = requestAnimationFrame(tick);
        };
        setSize();
        window.addEventListener('resize', setSize);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerdown', onPointerDown, true);
        window.addEventListener('pointerup', onPointerUp);
        rafId = requestAnimationFrame(tick);
        return () => {
            cancelled = true;
            window.removeEventListener('resize', setSize);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerdown', onPointerDown, true);
            window.removeEventListener('pointerup', onPointerUp);
            canvas.style.cursor = '';
            cancelAnimationFrame(rafId);
            materialRef.current = null;
            controlsRef.current = null;
            controls.dispose();
            for (const geo of toDispose)
                geo.dispose();
            for (const mat of toDisposeMat)
                mat.dispose();
            for (const tex of toDisposeTex)
                tex.dispose();
            renderer.dispose();
        };
    }, []);
    const handleWireframe = useCallback(() => {
        const next = !wireframe;
        setWireframe(next);
        if (materialRef.current)
            materialRef.current.wireframe = next;
    }, [wireframe]);
    return (_jsxs("div", { className: "escape-room-wrap", children: [_jsxs("header", { className: "escape-room-header", children: [_jsx(Title, { order: 3, className: "escape-room-title", children: "Escape Room" }), _jsx("p", { className: "escape-room-caption", children: "Left click to look around. Right click to move left and right. Scroll to zoom. Click the hanging light to cycle its color. Wall numbers only show under matching light. Click the door panel to enter codes." })] }), _jsxs("div", { className: "escape-room-stage", ref: rootRef, children: [_jsx("canvas", { ref: canvasRef }), panelOpen && (_jsx("div", { className: "escape-room-panel-overlay", onClick: () => setPanelOpen(false), children: _jsxs("div", { className: "escape-room-panel-card", role: "dialog", "aria-modal": "true", "aria-label": "Door panel", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { ref: closeButtonRef, type: "button", className: "escape-room-panel-close", "aria-label": "Close", onClick: () => setPanelOpen(false), children: "\u00D7" }), _jsx("div", { className: "escape-room-panel-codes", children: codes.map((code, index) => (_jsxs("label", { className: "escape-room-panel-code", children: [_jsxs("span", { children: ["Code ", index + 1] }), _jsx("input", { type: "text", value: code, autoComplete: "off", spellCheck: false, onChange: (e) => {
                                                    const value = e.target.value;
                                                    setCodes((current) => current.map((entry, i) => (i === index ? value : entry)));
                                                } })] }, index))) })] }) }))] }), _jsx("div", { className: "escape-room-controls", children: _jsx(Group, { gap: "sm", justify: "center", children: _jsx(Button, { onClick: handleWireframe, variant: "outline", children: wireframe ? 'Solid' : 'Wireframe' }) }) })] }));
}
export default EscapeRoom;
