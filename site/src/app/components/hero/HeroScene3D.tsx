import { Suspense, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  Environment,
  ContactShadows,
  MeshDistortMaterial,
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';

/* ──────────────────────────────────────────────────────────────────────
   Orbiting Ring with continuous rotation
   ────────────────────────────────────────────────────────────────────── */
function OrbitRing({
  radius = 2.2,
  tube = 0.03,
  tiltX = 0,
  tiltZ = 0,
  speed = 0.25,
}: {
  radius?: number;
  tube?: number;
  tiltX?: number;
  tiltZ?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * speed;
      ref.current.rotation.z += delta * (speed * 0.4);
    }
  });

  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, tube, 16, 100]} />
      <meshStandardMaterial
        color="#B8155F"
        metalness={0.95}
        roughness={0.05}
        emissive="#B8155F"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Satellite Shape with orbit path
   ────────────────────────────────────────────────────────────────────── */
function SatelliteShape({
  orbitRadius,
  speed,
  size,
  offset,
  geometry,
}: {
  orbitRadius: number;
  speed: number;
  size: number;
  offset: number;
  geometry: 'octahedron' | 'tetrahedron' | 'dodecahedron';
}) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.x = Math.cos(t) * orbitRadius;
    ref.current.position.z = Math.sin(t) * orbitRadius;
    ref.current.position.y = Math.sin(t * 2) * 0.45;
    ref.current.rotation.x += 0.02;
    ref.current.rotation.y += 0.03;
    ref.current.rotation.z += 0.015;
  });

  const geo = useMemo(() => {
    switch (geometry) {
      case 'octahedron':
        return <octahedronGeometry args={[size, 0]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[size, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[size, 0]} />;
    }
  }, [geometry, size]);

  return (
    <mesh ref={ref}>
      {geo}
      <meshStandardMaterial
        color="#F5F0EB"
        metalness={0.9}
        roughness={0.1}
        emissive="#B8155F"
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Central Rotating & Morphing 3D Emblem Core
   ────────────────────────────────────────────────────────────────────── */
function CoreEmblem() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.6;
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.z += delta * 0.15;
    }
  });

  return (
    <Float
      speed={2.5}
      rotationIntensity={0.6}
      floatIntensity={0.8}
      floatingRange={[-0.15, 0.15]}
    >
      <mesh ref={meshRef} scale={1.2}>
        <icosahedronGeometry args={[1.2, 2]} />
        <MeshDistortMaterial
          color="#B8155F"
          metalness={0.92}
          roughness={0.08}
          distort={0.4}
          speed={3.2}
          envMapIntensity={1.5}
        />
      </mesh>
    </Float>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Main 3D Scene Content
   ────────────────────────────────────────────────────────────────────── */
function Scene() {
  const groupRef = useRef<THREE.Group>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const { pointer } = useThree();

  /* Active mouse-reactive tilt and breathing light */
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const targetX = pointer.y * 0.25;
      const targetY = pointer.x * 0.35;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetX,
        0.06
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetY,
        0.06
      );
    }

    if (lightRef.current) {
      const t = clock.getElapsedTime();
      lightRef.current.intensity = 2.5 + Math.sin(t * 3) * 1.0;
    }
  });

  return (
    <>
      {/* Dynamic atmospheric lighting */}
      <ambientLight intensity={0.25} color="#1C1958" />
      <spotLight
        position={[0, 8, 3]}
        angle={0.6}
        penumbra={0.8}
        intensity={3.5}
        color="#B8155F"
        castShadow
        shadow-mapSize={1024}
      />
      <spotLight
        position={[6, 4, 5]}
        angle={0.7}
        penumbra={1}
        intensity={2.2}
        color="#FFFFFF"
      />
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={3.0}
        color="#B8155F"
        distance={6}
      />
      <pointLight position={[-4, -3, -2]} intensity={1.5} color="#B8155F" />

      {/* Floating cybernetic particles around the emblem */}
      <Sparkles
        count={70}
        scale={6}
        size={2.5}
        speed={1.2}
        opacity={0.75}
        color="#B8155F"
      />
      <Sparkles
        count={40}
        scale={5}
        size={2}
        speed={0.8}
        opacity={0.6}
        color="#F5F0EB"
      />

      <group ref={groupRef} position={[0.7, 0, 0]}>
        {/* Core emblem */}
        <CoreEmblem />

        {/* Orbiting rings */}
        <OrbitRing
          radius={2.1}
          tube={0.035}
          tiltX={Math.PI * 0.32}
          tiltZ={Math.PI * 0.12}
          speed={0.4}
        />
        <OrbitRing
          radius={2.5}
          tube={0.02}
          tiltX={Math.PI * -0.25}
          tiltZ={Math.PI * 0.38}
          speed={-0.25}
        />
        <OrbitRing
          radius={1.7}
          tube={0.015}
          tiltX={Math.PI * 0.55}
          tiltZ={Math.PI * -0.2}
          speed={0.5}
        />

        {/* Satellite orbiting shapes */}
        <SatelliteShape
          orbitRadius={1.9}
          speed={0.8}
          size={0.16}
          offset={0}
          geometry="octahedron"
        />
        <SatelliteShape
          orbitRadius={2.3}
          speed={0.6}
          size={0.13}
          offset={Math.PI * 0.66}
          geometry="tetrahedron"
        />
        <SatelliteShape
          orbitRadius={1.7}
          speed={0.7}
          size={0.14}
          offset={Math.PI * 1.33}
          geometry="dodecahedron"
        />
      </group>

      {/* Ground contact shadow */}
      <ContactShadows
        position={[0, -2.4, 0]}
        opacity={0.45}
        scale={9}
        blur={2}
        far={3.5}
        color="#B8155F"
      />

      {/* Environment reflections */}
      <Environment preset="city" />
    </>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Loading Fallback
   ────────────────────────────────────────────────────────────────────── */
function LoadingIndicator() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-magenta-600 animate-spin" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Error Boundary
   ────────────────────────────────────────────────────────────────────── */
interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* ──────────────────────────────────────────────────────────────────────
   Exported Canvas Wrapper
   ────────────────────────────────────────────────────────────────────── */
export default function HeroScene3D() {
  return (
    <WebGLErrorBoundary>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <Suspense fallback={<LoadingIndicator />}>
          <Canvas
            camera={{ position: [0, 0, 5.8], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
            style={{ width: '100%', height: '100%' }}
          >
            <Scene />
          </Canvas>
        </Suspense>
      </div>
    </WebGLErrorBoundary>
  );
}
