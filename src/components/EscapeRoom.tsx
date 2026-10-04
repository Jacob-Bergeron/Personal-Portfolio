import { useEffect, useRef, useState } from 'react';
import { Title } from '@mantine/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import '../styles/EscapeRoom.css';

// Room is centered on the origin. Y is up, -Z is the back wall, +Z is the door wall.
const ROOM_W = 8;
const ROOM_H = 4;
const ROOM_D = 8;

// Lamp cycles yellow → red → blue → white. It starts white; the first three match the wall digits.
const LAMP_COLORS = [0xf2d895, 0xff1a1a, 0x1a6aff, 0xffffff] as const;
const LAMP_YELLOW = LAMP_COLORS[0];
const LAMP_RED = LAMP_COLORS[1];
const LAMP_BLUE = LAMP_COLORS[2];
const LAMP_WHITE = LAMP_COLORS[3];
const LAMP_START_INDEX = 3;

// How quickly a wall digit fades in or out when the lamp color changes.
const DIGIT_FADE = 0.12;

// Door sits on the front wall; the keypad panel is a small box on its face.
const DOOR_H = ROOM_H * 0.8;
const DOOR_W = DOOR_H * 0.45;
const DOOR_T = 0.08;
const PANEL_W = 0.34;
const PANEL_H = 0.52;
const PANEL_T = 0.045;
const CODE_COUNT = 3;
const SLOT_COUNT = 3;

// Three letters written into the open book on the middle shelf. This is the last door code.
const BOOK_CODE = 'KEY';

function blankCodes() {
  return Array.from({ length: CODE_COUNT }, () => Array<string>(SLOT_COUNT).fill(''));
}

// Three numbers painted on the back wall. Each one only appears under its lamp color.
const WALL_DIGITS = [
  { digit: '1', tint: 0xff3b3b, x: -2.15, lamp: LAMP_RED },
  { digit: '2', tint: 0xf5d78a, x: 0, lamp: LAMP_YELLOW },
  { digit: '3', tint: 0x4a8cff, x: 2.15, lamp: LAMP_BLUE },
] as const;

// Draw a digit onto a canvas and turn it into a transparent plane that sits on the back wall.
function wallDigit(digit: string, tint: number, x: number) {
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

// Flat surface (floor, ceiling, walls, rug). Callers rotate the mesh to face the right way.
function plane(
  w: number,
  h: number,
  color: number,
): { mesh: THREE.Mesh; geo: THREE.PlaneGeometry; mat: THREE.MeshStandardMaterial } {
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

// Solid prop (door, trim, furniture). Casts and receives shadows.
function box(
  w: number,
  h: number,
  d: number,
  color: number,
): { mesh: THREE.Mesh; geo: THREE.BoxGeometry; mat: THREE.MeshStandardMaterial } {
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

function EscapeRoom() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  // Scene listeners can't see React state, so they read the latest overlay flag from this ref.
  const overlayOpenRef = useRef(false);
  const openPanelRef = useRef(() => {});
  const openBookRef = useRef(() => {});
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const bookCloseRef = useRef<HTMLButtonElement | null>(null);
  const slotRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: CODE_COUNT }, () => Array<HTMLInputElement | null>(SLOT_COUNT).fill(null)),
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [codes, setCodes] = useState(blankCodes);

  // Opening an overlay freezes the camera so dragging it doesn't orbit the room.
  openPanelRef.current = () => {
    if (controlsRef.current) controlsRef.current.enabled = false;
    setBookOpen(false);
    setPanelOpen(true);
  };
  openBookRef.current = () => {
    if (controlsRef.current) controlsRef.current.enabled = false;
    setPanelOpen(false);
    setBookOpen(true);
  };

  // Keep the ref, camera lock, and Escape-to-close behavior in sync with the overlay.
  useEffect(() => {
    const overlayOpen = panelOpen || bookOpen;
    overlayOpenRef.current = overlayOpen;
    if (controlsRef.current) controlsRef.current.enabled = !overlayOpen;
    if (!overlayOpen) return;
    if (bookOpen) bookCloseRef.current?.focus();
    else {
      const firstSlot = slotRefs.current[0]?.[0];
      if (firstSlot) firstSlot.focus();
      else closeButtonRef.current?.focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setPanelOpen(false);
      setBookOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen, bookOpen]);

  // Build the Three.js scene once. Everything created here is disposed on unmount.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

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

    // Collected so cleanup can free GPU memory without tracking every object by name.
    const toDispose: THREE.BufferGeometry[] = [];
    const toDisposeMat: THREE.Material[] = [];
    const toDisposeTex: THREE.Texture[] = [];

    // Room shell. Planes face +Z by default, so each wall is rotated toward the inside.
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

    // Keypad sits slightly proud of the door so it can be raycast separately.
    const panel = box(PANEL_W, PANEL_H, PANEL_T, 0x8d939a);
    const panelX = -(DOOR_W / 2 - PANEL_W / 2 - 0.1);
    panel.mesh.position.set(panelX, DOOR_H / 2, doorZ - DOOR_T / 2 - PANEL_T / 2);

    for (const piece of [door, panel]) {
      scene.add(piece.mesh);
      toDispose.push(piece.geo);
      toDisposeMat.push(piece.mat);
    }

    // Add a mesh at a world position and remember it for disposal.
    const place = (
      piece: { mesh: THREE.Mesh; geo: THREE.BufferGeometry; mat: THREE.Material },
      x: number,
      y: number,
      z: number,
    ) => {
      piece.mesh.position.set(x, y, z);
      scene.add(piece.mesh);
      toDispose.push(piece.geo);
      toDisposeMat.push(piece.mat);
      return piece;
    };

    const rug = plane(2.4, 2.4, 0xb89a72);
    rug.mesh.rotation.x = -Math.PI / 2;
    place(rug, 0, 0.012, 0);

    // Baseboard runs around the room, split on the front wall so it doesn't cover the door.
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

    // Bookcase against the left wall. The group is scaled so the case nearly reaches the ceiling.
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
    // Positions are given in world space, then converted into the scaled group's local space.
    const placeOnShelf = (
      piece: { mesh: THREE.Mesh; geo: THREE.BufferGeometry; mat: THREE.Material },
      x: number,
      y: number,
      z: number,
    ) => {
      piece.mesh.position.set(x - shelfAnchor.x, y - shelfAnchor.y, z - shelfAnchor.z);
      shelving.add(piece.mesh);
      toDispose.push(piece.geo);
      toDisposeMat.push(piece.mat);
    };
    const caseX = shelfAnchor.x + caseD / 2;
    const bay = (caseH - board * 4) / 3;
    placeOnShelf(box(caseD, caseH, board, trim), caseX, caseH / 2, caseZ - caseW / 2 + board / 2);
    placeOnShelf(box(caseD, caseH, board, trim), caseX, caseH / 2, caseZ + caseW / 2 - board / 2);
    placeOnShelf(
      box(0.02, caseH, caseW, 0x4a382c),
      shelfAnchor.x + 0.01,
      caseH / 2,
      caseZ,
    );
    // Bottom, two mid shelves, and the top cap.
    const shelfCenters = [
      board / 2,
      board + bay + board / 2,
      board * 2 + bay * 2 + board / 2,
      caseH - board / 2,
    ];
    for (const y of shelfCenters) {
      placeOnShelf(box(caseD - 0.04, board, caseW - board * 2, trim), caseX + 0.015, y, caseZ);
    }

    // One row of books per open bay. Width is along Z so the spines face into the room.
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
    const innerLeft = caseZ - (caseW - board * 2) / 2 + 0.04;
    const placeBookRow = (row: (typeof bookRows)[number], rowIndex: number, startZ: number) => {
      const shelfTop = shelfCenters[rowIndex] + board / 2;
      let z = startZ;
      for (const book of row) {
        placeOnShelf(box(0.22, book.h, book.w, book.color), bookX, shelfTop + book.h / 2, z + book.w / 2);
        z += book.w + 0.02;
      }
      return z;
    };
    placeBookRow(bookRows[0], 0, innerLeft);
    placeBookRow(bookRows[2], 2, innerLeft);

    // Facing the bookcase, left is +Z. The open book lies there, beside the closed row.
    const middleTop = shelfCenters[1] + board / 2;
    const openSpan = 0.46;
    const middleEnd = placeBookRow(bookRows[1], 1, innerLeft);
    const openBookZ = middleEnd + 0.3 + openSpan / 2;

    // Open book propped at 45 degrees. The front edge stays on the shelf so the pages face the room.
    const bookPieces: THREE.Mesh[] = [];
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0x6b2d24,
      roughness: 0.78,
      metalness: 0.05,
    });
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = 256;
    pageCanvas.height = 512;
    const pageCtx = pageCanvas.getContext('2d');
    if (!pageCtx) {
      throw new Error('Could not create book page canvas');
    }
    pageCtx.fillStyle = '#f7f4ec';
    pageCtx.fillRect(0, 0, 256, 512);
    pageCtx.fillStyle = '#d5cfc3';
    for (let line = 56; line < 460; line += 28) {
      pageCtx.fillRect(36, line, 184, 4);
    }
    const pageTex = new THREE.CanvasTexture(pageCanvas);
    pageTex.colorSpace = THREE.SRGBColorSpace;
    const pageFaceMat = new THREE.MeshStandardMaterial({
      map: pageTex,
      color: 0xfffdf8,
      roughness: 0.92,
      metalness: 0,
      emissive: 0xf4f0e6,
      emissiveIntensity: 0.18,
    });
    const pageEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xf7f4ec,
      roughness: 0.92,
      metalness: 0,
    });
    toDisposeMat.push(coverMat, pageFaceMat, pageEdgeMat);
    toDisposeTex.push(pageTex);

    const bookScale = 1.1;
    const coverHalfX = 0.12;
    const coverBottom = -0.014;
    const bookPivot = new THREE.Group();
    bookPivot.rotation.z = -Math.PI / 4;
    bookPivot.position.set(
      bookX + coverHalfX * bookScale - shelfAnchor.x,
      middleTop - shelfAnchor.y,
      openBookZ - shelfAnchor.z,
    );
    shelving.add(bookPivot);

    const openBook = new THREE.Group();
    openBook.scale.setScalar(bookScale);
    openBook.position.set(-coverHalfX * bookScale, -coverBottom * bookScale, 0);
    bookPivot.add(openBook);

    const addBookPart = (mesh: THREE.Mesh, geo: THREE.BufferGeometry) => {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      bookPieces.push(mesh);
      toDispose.push(geo);
    };

    const spineGeo = new THREE.BoxGeometry(0.22, 0.035, 0.03);
    const spine = new THREE.Mesh(spineGeo, coverMat);
    addBookPart(spine, spineGeo);
    openBook.add(spine);

    // A small lift at the outer edge keeps the two pages from reading as one flat sheet.
    const hingeOpen = 0.28;
    for (const direction of [-1, 1] as const) {
      const wing = new THREE.Group();
      wing.rotation.x = direction === -1 ? hingeOpen : -hingeOpen;
      const coverGeo = new THREE.BoxGeometry(0.24, 0.012, 0.2);
      const cover = new THREE.Mesh(coverGeo, coverMat);
      cover.position.set(0, -0.008, direction * 0.115);
      const pageGeo = new THREE.BoxGeometry(0.2, 0.018, 0.16);
      const page = new THREE.Mesh(pageGeo, [
        pageEdgeMat,
        pageEdgeMat,
        pageFaceMat,
        pageEdgeMat,
        pageEdgeMat,
        pageEdgeMat,
      ]);
      page.position.set(0, 0.01, direction * 0.095);
      wing.add(cover, page);
      addBookPart(cover, coverGeo);
      addBookPart(page, pageGeo);
      openBook.add(wing);
    }

    // Plant shelves: three on the right wall, and one on the left wall above the chair.
    const shelfT = 0.06;
    const shelfD = 0.42;
    const shelfW = 2.5;
    const shelfBack = ROOM_W / 2 - baseT;
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
    const addPlantShelf = (wallSign: number, centerZ: number, shelfTop: number) => {
      const back = wallSign * shelfBack;
      const inward = -wallSign;
      place(
        box(shelfD, shelfT, shelfW, trim),
        back + inward * (shelfD / 2),
        shelfTop - shelfT / 2,
        centerZ,
      );
      for (const z of [-0.95, 0.95]) {
        place(box(0.22, 0.2, 0.06, trim), back + inward * 0.14, shelfTop - shelfT - 0.1, centerZ + z);
      }
      const plantX = back + inward * 0.2;
      for (const plant of plants) {
        const potGeo = new THREE.CylinderGeometry(plant.potR * 0.86, plant.potR, plant.potH, 14);
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.set(plantX, shelfTop + plant.potH / 2, centerZ + plant.z);
        pot.castShadow = true;
        pot.receiveShadow = true;
        const leafGeo = new THREE.ConeGeometry(plant.leafR, plant.leafH, 10);
        const leaves = new THREE.Mesh(leafGeo, leafMats[plant.leaf]);
        leaves.position.set(plantX, shelfTop + plant.potH + plant.leafH / 2 - 0.03, centerZ + plant.z);
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        scene.add(pot, leaves);
        toDispose.push(potGeo, leafGeo);
      }
    };
    const sideZ = shelfW + 0.15;
    addPlantShelf(1, 0, ROOM_H * (2 / 3));
    addPlantShelf(1, sideZ, ROOM_H / 3);
    addPlantShelf(1, -sideZ, ROOM_H / 3);
    addPlantShelf(-1, 2.6, ROOM_H * (2 / 3));
    toDisposeMat.push(potMat, ...leafMats);

    // Chair in the front-left corner, turned to face the center of the room.
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
    const legOffsets: [number, number][] = [
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

    // Dim fill plus one hanging point light that the player can recolor.
    const ambient = new THREE.AmbientLight(0xc7d1c8, 0.22);
    const lampY = 2.55;
    const lamp = new THREE.PointLight(LAMP_WHITE, 55, 18);
    lamp.position.set(0, lampY, 0);
    lamp.castShadow = true;
    lamp.shadow.mapSize.set(1024, 1024);
    lamp.shadow.camera.near = 0.2;
    lamp.shadow.camera.far = 16;
    scene.add(ambient, lamp);

    // Visible bulb, socket, and cord. The point light itself is invisible.
    const lampFixture = new THREE.Group();
    lampFixture.position.copy(lamp.position);

    const bulbGeo = new THREE.SphereGeometry(0.16, 24, 16);
    const bulbMat = new THREE.MeshStandardMaterial({
      color: LAMP_WHITE,
      emissive: LAMP_WHITE,
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

    // Recolor the light and bulb, and tell each digit whether it should be visible.
    let lampColorIndex = LAMP_START_INDEX;
    const applyLampColor = (hex: number) => {
      lamp.color.setHex(hex);
      bulbMat.color.setHex(hex);
      bulbMat.emissive.setHex(hex);
      for (const d of digits) {
        d.targetOpacity = hex === d.lamp ? 1 : 0;
      }
    };
    applyLampColor(LAMP_WHITE);

    // Pointer → NDC, then raycast. Used for hover cursor and click targets.
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const setPointerFromEvent = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const hitObjects = (e: PointerEvent, objects: THREE.Object3D[]) => {
      setPointerFromEvent(e);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(objects).length > 0;
    };
    const hitLamp = (e: PointerEvent) => hitObjects(e, [bulb, cap]);
    const hitPanel = (e: PointerEvent) => hitObjects(e, [panel.mesh]);
    const hitBook = (e: PointerEvent) => hitObjects(e, bookPieces);

    // A press only counts as a click if the pointer barely moved. Orbit drag is ignored.
    let clickPointer: { x: number; y: number; kind: 'panel' | 'book' } | null = null;
    const clickSlop = 6;

    const onPointerMove = (e: PointerEvent) => {
      if (clickPointer) {
        const dx = e.clientX - clickPointer.x;
        const dy = e.clientY - clickPointer.y;
        if (dx * dx + dy * dy > clickSlop * clickSlop) clickPointer = null;
      }
      if (overlayOpenRef.current) {
        canvas.style.cursor = '';
        return;
      }
      canvas.style.cursor = hitLamp(e) || hitPanel(e) || hitBook(e) ? 'pointer' : 'grab';
    };
    const onPointerDown = (e: PointerEvent) => {
      clickPointer = null;
      if (e.button !== 0 || overlayOpenRef.current) return;
      if (hitLamp(e)) {
        e.stopImmediatePropagation();
        lampColorIndex = (lampColorIndex + 1) % LAMP_COLORS.length;
        applyLampColor(LAMP_COLORS[lampColorIndex] ?? LAMP_COLORS[0]);
        return;
      }
      if (hitBook(e)) clickPointer = { x: e.clientX, y: e.clientY, kind: 'book' };
      else if (hitPanel(e)) clickPointer = { x: e.clientX, y: e.clientY, kind: 'panel' };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!clickPointer || e.button !== 0) {
        clickPointer = null;
        return;
      }
      const start = clickPointer;
      clickPointer = null;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (dx * dx + dy * dy > clickSlop * clickSlop) return;
      if (start.kind === 'book' && hitBook(e)) {
        e.stopImmediatePropagation();
        openBookRef.current();
        return;
      }
      if (start.kind === 'panel' && hitPanel(e)) {
        e.stopImmediatePropagation();
        openPanelRef.current();
      }
    };

    // Look around with left drag, pan with right drag, zoom with scroll.
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1.15, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 0.8;
    controls.maxDistance = 5.2;

    // Keep both the camera and its look target inside the walls.
    const inset = 0.35;
    const roomMin = new THREE.Vector3(
      -ROOM_W / 2 + inset,
      inset,
      -ROOM_D / 2 + inset,
    );
    const roomMax = new THREE.Vector3(
      ROOM_W / 2 - inset,
      ROOM_H - inset,
      ROOM_D / 2 - inset,
    );
    const panDelta = new THREE.Vector3();

    const keepInsideRoom = () => {
      panDelta.copy(controls.target);
      controls.target.clamp(roomMin, roomMax);
      panDelta.sub(controls.target);
      camera.position.sub(panDelta);
      camera.position.clamp(roomMin, roomMax);
    };

    controlsRef.current = controls;
    controls.enabled = !overlayOpenRef.current;
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

    // Ease digit opacity toward its target, then render.
    const tick = () => {
      if (cancelled) return;
      if (document.visibilityState !== 'hidden') {
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
      controlsRef.current = null;
      controls.dispose();
      for (const geo of toDispose) geo.dispose();
      for (const mat of toDisposeMat) mat.dispose();
      for (const tex of toDisposeTex) tex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="escape-room-wrap">
      <header className="escape-room-header">
        <Title order={3} className="escape-room-title">
          Escape Room
        </Title>
        <p className="escape-room-caption">
          Left click to look around. Right click to move left and right. Scroll
          to zoom. Click the hanging light to cycle its color. Wall numbers
          only show under matching light. Click the open book on the middle
          shelf to read it. Click the door panel to enter codes.
        </p>
      </header>
      <div className="escape-room-stage" ref={rootRef}>
        <canvas
          ref={canvasRef}
  
        />
        {panelOpen && (
          <div
            className="escape-room-panel-overlay"
            onClick={() => setPanelOpen(false)}
          >
            <div
              className="escape-room-panel-card"
              role="dialog"
              aria-modal="true"
              aria-label="Door panel"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                ref={closeButtonRef}
                type="button"
                className="escape-room-panel-close"
                aria-label="Close"
                onClick={() => setPanelOpen(false)}
              >
                ×
              </button>
              <div className="escape-room-panel-codes">
                {codes.map((slots, codeIndex) => (
                  <div key={codeIndex} className="escape-room-panel-code">
                    <span id={`door-code-${codeIndex}`}>Code {codeIndex + 1}</span>
                    {codeIndex === 0 && (
                      <div
                        className="escape-room-plant-hint"
                        role="img"
                        aria-label="Medium plant, largest plant, smallest plant"
                      >
                        <svg className="plant-medium" viewBox="0 0 40 48" aria-hidden="true">
                          <polygon points="20,2 38,46 2,46" />
                        </svg>
                        <svg className="plant-large" viewBox="0 0 40 48" aria-hidden="true">
                          <polygon points="20,2 38,46 2,46" />
                        </svg>
                        <svg className="plant-small" viewBox="0 0 40 48" aria-hidden="true">
                          <polygon points="20,2 38,46 2,46" />
                        </svg>
                      </div>
                    )}
                    {codeIndex === 1 && (
                      <div
                        className="escape-room-lamp-hint"
                        role="img"
                        aria-label="Red, blue, yellow"
                      >
                        <span className="lamp-red" />
                        <span className="lamp-blue" />
                        <span className="lamp-yellow" />
                      </div>
                    )}
                    <div
                      className="escape-room-panel-slots"
                      role="group"
                      aria-labelledby={`door-code-${codeIndex}`}
                    >
                      {slots.map((slot, slotIndex) => (
                        <input
                          key={slotIndex}
                          ref={(el) => {
                            slotRefs.current[codeIndex][slotIndex] = el;
                          }}
                          type="text"
                          inputMode="text"
                          value={slot}
                          aria-label={`Code ${codeIndex + 1} character ${slotIndex + 1}`}
                          autoComplete="off"
                          autoCapitalize="characters"
                          spellCheck={false}
                          onFocus={(e) => e.target.select()}
                          onPaste={(e) => {
                            e.preventDefault();
                            const pasted = e.clipboardData
                              .getData('text')
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, '')
                              .slice(0, SLOT_COUNT - slotIndex);
                            if (!pasted) return;
                            setCodes((current) =>
                              current.map((row, i) => {
                                if (i !== codeIndex) return row;
                                const next = [...row];
                                pasted.split('').forEach((char, offset) => {
                                  next[slotIndex + offset] = char;
                                });
                                return next;
                              }),
                            );
                            const after = slotIndex + pasted.length;
                            const target = after < SLOT_COUNT ? after : SLOT_COUNT - 1;
                            slotRefs.current[codeIndex]?.[target]?.focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace') {
                              e.preventDefault();
                              if (slot) {
                                setCodes((current) =>
                                  current.map((row, i) =>
                                    i === codeIndex
                                      ? row.map((entry, j) => (j === slotIndex ? '' : entry))
                                      : row,
                                  ),
                                );
                                return;
                              }
                              if (slotIndex === 0) return;
                              setCodes((current) =>
                                current.map((row, i) =>
                                  i === codeIndex
                                    ? row.map((entry, j) => (j === slotIndex - 1 ? '' : entry))
                                    : row,
                                ),
                              );
                              slotRefs.current[codeIndex]?.[slotIndex - 1]?.focus();
                              return;
                            }
                            if (e.key === 'ArrowLeft' && slotIndex > 0) {
                              e.preventDefault();
                              slotRefs.current[codeIndex]?.[slotIndex - 1]?.focus();
                            }
                            if (e.key === 'ArrowRight' && slotIndex < SLOT_COUNT - 1) {
                              e.preventDefault();
                              slotRefs.current[codeIndex]?.[slotIndex + 1]?.focus();
                            }
                          }}
                          onChange={(e) => {
                            const chars = e.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, '');
                            if (chars.length > 1 && !(slot && chars.length === 2)) {
                              const pasted = chars.slice(0, SLOT_COUNT - slotIndex);
                              setCodes((current) =>
                                current.map((row, i) => {
                                  if (i !== codeIndex) return row;
                                  const next = [...row];
                                  pasted.split('').forEach((char, offset) => {
                                    next[slotIndex + offset] = char;
                                  });
                                  return next;
                                }),
                              );
                              const after = slotIndex + pasted.length;
                              const target = after < SLOT_COUNT ? after : SLOT_COUNT - 1;
                              slotRefs.current[codeIndex]?.[target]?.focus();
                              return;
                            }
                            const nextChar =
                              slot && chars.length === 2
                                ? (chars.replace(slot, '').slice(-1) || chars.slice(-1))
                                : chars.slice(-1);
                            setCodes((current) =>
                              current.map((row, i) =>
                                i === codeIndex
                                  ? row.map((entry, j) => (j === slotIndex ? nextChar : entry))
                                  : row,
                              ),
                            );
                            if (nextChar && slotIndex < SLOT_COUNT - 1) {
                              slotRefs.current[codeIndex]?.[slotIndex + 1]?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {bookOpen && (
          <div
            className="escape-room-panel-overlay"
            onClick={() => setBookOpen(false)}
          >
            <div
              className="escape-room-book-page"
              role="dialog"
              aria-modal="true"
              aria-label="Open book"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                ref={bookCloseRef}
                type="button"
                className="escape-room-panel-close"
                aria-label="Close"
                onClick={() => setBookOpen(false)}
              >
                ×
              </button>
              <p>
                Most of the page has faded to a list of names and dates. The
                last line is still dark, and the only letters left on it are{' '}
                <span className="escape-room-book-code">{BOOK_CODE}</span>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EscapeRoom;
