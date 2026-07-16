import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import type { Group } from 'three';

/** The brand orb: a distorted metallic sphere that leans toward the pointer. */
function Scene() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.18;
    // Ease toward the pointer for a subtle interactive tilt
    group.current.rotation.x += (state.pointer.y * 0.35 - group.current.rotation.x) * 0.06;
    group.current.position.x += (state.pointer.x * 0.25 - group.current.position.x) * 0.06;
  });

  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={0.35} floatIntensity={1.1}>
        <mesh>
          <sphereGeometry args={[1.35, 64, 64]} />
          <MeshDistortMaterial
            color="#6366f1"
            emissive="#4338ca"
            emissiveIntensity={0.3}
            distort={0.42}
            speed={2}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>
      </Float>
      <Sparkles count={70} scale={5.5} size={2.4} speed={0.4} color="#a5b4fc" />
    </group>
  );
}

export default function SphereCanvas() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 4.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 3, 5]} intensity={1.5} />
      <pointLight position={[-4, -2, -4]} intensity={1.2} color="#d946ef" />
      <Scene />
    </Canvas>
  );
}
