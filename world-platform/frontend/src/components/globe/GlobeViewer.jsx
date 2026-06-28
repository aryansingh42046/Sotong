import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

const GLOBE_RADIUS = 2;

const latLonToVec3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

export default function GlobeViewer({ worlds = [], globeColor = '#1a237e', onSelectWorld }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const globeRef = useRef(null);
  const markersRef = useRef([]);
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, world: null });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 6;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0x6366f1, 0.3);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);

    // Globe
    const geo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(globeColor),
      emissive: new THREE.Color(globeColor).multiplyScalar(0.15),
      shininess: 60,
      transparent: true,
      opacity: 0.92,
    });
    const globe = new THREE.Mesh(geo, mat);
    scene.add(globe);
    globeRef.current = globe;

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.08 });
    const wireGeo = new THREE.SphereGeometry(GLOBE_RADIUS + 0.01, 32, 32);
    scene.add(new THREE.Mesh(wireGeo, wireMat));

    // Atmosphere glow
    const atmoGeo = new THREE.SphereGeometry(GLOBE_RADIUS + 0.15, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1, transparent: true, opacity: 0.06, side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 2000; i++) {
      starVerts.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 })));

    // Animation loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (!isDragging.current) globe.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w2 = mount.clientWidth, h2 = mount.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  // Update globe color when it changes
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.material.color.set(globeColor);
      globeRef.current.material.emissive.set(new THREE.Color(globeColor).multiplyScalar(0.15));
    }
  }, [globeColor]);

  // Place world markers
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    markersRef.current.forEach(m => scene.remove(m));
    markersRef.current = [];

    worlds.forEach((world) => {
      const pos = world.globePosition || { latitude: Math.random() * 140 - 70, longitude: Math.random() * 360 - 180 };
      const vec = latLonToVec3(pos.latitude, pos.longitude, GLOBE_RADIUS + 0.05);
      const color = world.globeColor || '#6366f1';

      const geo = new THREE.SphereGeometry(0.06, 16, 16);
      const mat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
      const marker = new THREE.Mesh(geo, mat);
      marker.position.copy(vec);
      marker.userData = { world, originalColor: color };
      scene.add(marker);
      markersRef.current.push(marker);
    });
  }, [worlds]);

  // Drag rotation
  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    prevMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e) => {
    const mount = mountRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    if (!mount || !camera || !renderer || !scene) return;

    // Drag rotate
    if (isDragging.current && globeRef.current) {
      const dx = (e.clientX - prevMouse.current.x) * 0.005;
      const dy = (e.clientY - prevMouse.current.y) * 0.005;
      globeRef.current.rotation.y += dx;
      globeRef.current.rotation.x += dy;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Raycasting for hover
    const rect = mount.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(markersRef.current);

    markersRef.current.forEach(m => {
      m.material.emissiveIntensity = 0.5;
      m.scale.setScalar(1);
    });

    if (hits.length > 0) {
      const hit = hits[0].object;
      hit.material.emissiveIntensity = 1.5;
      hit.scale.setScalar(1.5);
      setTooltip({ visible: true, x: e.clientX - rect.left, y: e.clientY - rect.top, world: hit.userData.world });
      mount.style.cursor = 'pointer';
    } else {
      setTooltip({ visible: false, x: 0, y: 0, world: null });
      mount.style.cursor = isDragging.current ? 'grabbing' : 'grab';
    }
  }, []);

  const onMouseUp = useCallback(() => { isDragging.current = false; }, []);

  const onClick = useCallback((e) => {
    const mount = mountRef.current;
    const camera = cameraRef.current;
    if (!mount || !camera) return;

    const rect = mount.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(markersRef.current);
    if (hits.length > 0) {
      onSelectWorld?.(hits[0].object.userData.world);
    }
  }, [onSelectWorld]);

  const onWheel = useCallback((e) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(3.5, Math.min(10, cameraRef.current.position.z + e.deltaY * 0.005));
  }, []);

  return (
    <div className="relative w-full h-full" style={{ cursor: 'grab' }}>
      <div
        ref={mountRef}
        className="w-full h-full"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={onClick}
        onWheel={onWheel}
      />

      {tooltip.visible && tooltip.world && (
        <div
          className="absolute z-10 glass rounded-xl px-4 py-3 pointer-events-none min-w-48 max-w-64"
          style={{ left: tooltip.x + 16, top: tooltip.y - 10 }}
        >
          <p className="font-semibold text-sm text-white">{tooltip.world.name}</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{tooltip.world.description || 'No description'}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-indigo-300">👥 {tooltip.world._count?.members || 0} members</span>
            <span className={`text-xs ${tooltip.world.visibility === 'public' ? 'text-green-400' : 'text-yellow-400'}`}>
              {tooltip.world.visibility === 'public' ? '🌍 Public' : '🔒 Private'}
            </span>
          </div>
          <p className="text-xs text-indigo-400 mt-2">Click to enter</p>
        </div>
      )}
    </div>
  );
}
