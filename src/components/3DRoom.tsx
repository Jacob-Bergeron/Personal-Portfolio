import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Group, Title } from '@mantine/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import '../styles/3DRoom.css';

const ROOM_W = 8;
const ROOM_H = 4;
const ROOM_D = 8;
const ICO_RADIUS = 0.55;
const IDLE_Y = 0.004;

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

function ThreeDRoom() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const [wireframe, setWireframe] = useState(true);

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

    const toDispose: THREE.BufferGeometry[] = [];
    const toDisposeMat: THREE.Material[] = [];

    const floor = plane(ROOM_W, ROOM_D, 0x2a2418);
    floor.mesh.rotation.x = -Math.PI / 2;
    floor.mesh.position.y = 0;

    const ceiling = plane(ROOM_W, ROOM_D, 0x111d13);
    ceiling.mesh.rotation.x = Math.PI / 2;
    ceiling.mesh.position.y = ROOM_H;

    const back = plane(ROOM_W, ROOM_H, 0x1a2a1c);
    back.mesh.position.set(0, ROOM_H / 2, -ROOM_D / 2);

    const front = plane(ROOM_W, ROOM_H, 0x1a2a1c);
    front.mesh.rotation.y = Math.PI;
    front.mesh.position.set(0, ROOM_H / 2, ROOM_D / 2);

    const left = plane(ROOM_D, ROOM_H, 0x16301c);
    left.mesh.rotation.y = Math.PI / 2;
    left.mesh.position.set(-ROOM_W / 2, ROOM_H / 2, 0);

    const right = plane(ROOM_D, ROOM_H, 0x16301c);
    right.mesh.rotation.y = -Math.PI / 2;
    right.mesh.position.set(ROOM_W / 2, ROOM_H / 2, 0);

    const walls = [floor, ceiling, back, front, left, right];
    for (const wall of walls) {
      scene.add(wall.mesh);
      toDispose.push(wall.geo);
      toDisposeMat.push(wall.mat);
    }

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

    const ambient = new THREE.AmbientLight(0xc7d1c8, 0.22);
    const lamp = new THREE.PointLight(0xf2d895, 55, 18);
    lamp.position.set(0, ROOM_H - 0.35, 0);
    lamp.castShadow = true;
    lamp.shadow.mapSize.set(1024, 1024);
    lamp.shadow.camera.near = 0.2;
    lamp.shadow.camera.far = 16;
    const fill = new THREE.PointLight(0xc7d1c8, 12, 14);
    fill.position.set(-2.2, 1.4, 2.4);
    scene.add(ambient, lamp, fill);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1.15, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 0.8;
    controls.maxDistance = 5.2;

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

    const tick = () => {
      if (cancelled) return;
      if (document.visibilityState !== 'hidden') {
        ico.rotation.y += IDLE_Y;
        controls.update();
        keepInsideRoom();
        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(tick);
    };

    setSize();
    window.addEventListener('resize', setSize);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(rafId);
      materialRef.current = null;
      controls.dispose();
      for (const geo of toDispose) geo.dispose();
      for (const mat of toDisposeMat) mat.dispose();
      renderer.dispose();
    };
  }, []);

  const handleWireframe = useCallback(() => {
    const next = !wireframe;
    setWireframe(next);
    if (materialRef.current) materialRef.current.wireframe = next;
  }, [wireframe]);

  return (
    <div className="room-3d-wrap">
      <header className="room-3d-header">
        <Title order={3} className="room-3d-title">
          3D Room
        </Title>
        <p className="room-3d-caption">
          Drag to look around. The icosahedron sits on a pedestal under a ceiling lamp.
        </p>
      </header>
      <div className="room-3d-stage" ref={rootRef}>
        <canvas
          ref={canvasRef}
          aria-label="3D room with an icosahedron. Drag to orbit the camera."
        />
      </div>
      <div className="room-3d-controls">
        <Group gap="sm" justify="center">
          <Button onClick={handleWireframe} variant="outline">
            {wireframe ? 'Solid' : 'Wireframe'}
          </Button>
        </Group>
      </div>
    </div>
  );
}

export default ThreeDRoom;
