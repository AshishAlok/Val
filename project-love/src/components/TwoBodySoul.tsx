import React, { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from "three";


function StarField({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    const minRadius = 15; // Keep them outside the animation area
    const maxRadius = 40;

    for (let i = 0; i < count; i++) {
      // Math to distribute points evenly on a spherical shell
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = minRadius + Math.random() * (maxRadius - minRadius);

      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
          // TODO: find a better way to prevent this warning without hardcoding the count
          // added args to prevent a warning about missing count
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        color="white" 
        transparent 
        opacity={0.8} 
        sizeAttenuation={true} 
      />
    </points>
  );
}

function BinaryStars({ resetTrigger }: { resetTrigger: number }) {
  const star1 = useRef<any>(0);
  const star2 = useRef<any>(0);
  const heart = useRef<any>(0);
  const [phase, setPhase] = React.useState("orbit");
  
  // We'll use these to track the animation state
  const timer = useRef(0);
  const currentAngle = useRef(0);

  // --- 1. DEFINE THE HEART SHAPE ---
  const heartGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    
    // Drawing the heart using Cubic Bezier Curves
    shape.moveTo(x + 0.5, y + 0.5);
    shape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    shape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    shape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    shape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    shape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    shape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    // Extrude settings give it 3D depth and rounded bevels
    const extrudeSettings = {
      depth: 0.4,           // How thick the heart is
      bevelEnabled: true,   // Rounded edges
      bevelSegments: 4,     // Smoothness of edges
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Center the geometry so it rotates around its middle, not the corner
  useMemo(() => {
    heartGeometry.center();
  }, [heartGeometry]);

  useFrame((_, delta) => {
    // 1. PHASE: ORBITING
    if (phase === "orbit") {
      timer.current += delta;
      
      // Calculate Radius: Starts at 4, shrinks to 0.5
      const r = Math.max(0.1, 4 - timer.current * 0.4);
      
      // REALISTIC SPEED: 
      // We increase the angle based on (1 / r). 
      // As r gets smaller, 'angularVelocity' gets much larger.
      const angularVelocity = 6 / Math.sqrt(r);
      currentAngle.current += delta * angularVelocity;

      // Position the stars symmetrically around the center
      star1.current.position.set(
        Math.cos(currentAngle.current) * r, 
        0, 
        Math.sin(currentAngle.current) * r
      );
      star2.current.position.set(
        -Math.cos(currentAngle.current) * r, 
        0, 
        -Math.sin(currentAngle.current) * r
      );

      // Transition to flash when they collide
      if (r <= 0.2) {
        setPhase("flash");
        timer.current = 0;
      }

    // 2. PHASE: FLASH
    } else if (phase === "flash") {
      timer.current += delta;
      if (timer.current > 0.8) {
        setPhase("heart");
      }

    // 3. PHASE: HEART
    } else if (phase === "heart") {
      heart.current.rotation.y += delta * 0.8;
      // Gentle floating effect
      heart.current.position.y = Math.sin(Date.now() * 0.002) * 0.2;
    }
  });

  // Reset Logic
  React.useEffect(() => {
    setPhase("orbit");
    timer.current = 0;
    currentAngle.current = 0;
  }, [resetTrigger]);

  return (
      <>
      {/* 1. ORBIT PHASE */}
      {phase === "orbit" && (
        <>
          <mesh ref={star1}>
            <sphereGeometry args={[0.5, 64, 64]} />
            <meshStandardMaterial color="white" emissive="#ff8800" emissiveIntensity={2} toneMapped={false} />
          </mesh>
          <mesh ref={star2}>
            <sphereGeometry args={[0.4, 64, 64]} />
            <meshStandardMaterial color="white" emissive="#ffcc00" emissiveIntensity={1.5} toneMapped={false} />
          </mesh>
        </>
      )}

      {phase === "flash" && (
        <mesh>
          <sphereGeometry args={[15, 32, 32]} />
          <meshBasicMaterial 
            color="white" 
            transparent 
            opacity={1} 
            side={THREE.BackSide} // <--- THIS IS THE FIX
          />
        </mesh>
      )}

      {phase === "heart" && (
        <mesh 
          ref={heart} 
          geometry={heartGeometry} 
          rotation={[Math.PI, 0, 0]} // Flip it so it stands upright
        >
          <meshPhysicalMaterial 
            color="#ff0044" 
            emissive="#ff0000"     // The color of the glow
            emissiveIntensity={1.5}  // Boost this to make it "shine"
            roughness={2}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            toneMapped={false}     // Essential: allows brightness to exceed 1.0 for Bloom
          />
        </mesh>
      )}
    </>
  );
}

export default function TwoBodySoul() {
  const [reset, setReset] = useState(0);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 3, 7] }}>
        {/* <ambientLight intensity={0.5} /> */}
        <pointLight position={[10, 10, 10]} />
        <StarField count={3000} /> {/* Add the background stars here */}
        <BinaryStars resetTrigger={reset} />
        <EffectComposer>
          <Bloom 
            intensity={1} 
            luminanceThreshold={0} 
            luminanceSmoothing={0.2} 
            mipmapBlur
          />
        </EffectComposer>
        <OrbitControls />
      </Canvas>

      <button
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-pink-500 px-6 py-3 rounded-2xl shadow-lg hover:bg-pink-600"
        onClick={() => setReset((r) => r + 1)}
      >
        Refresh Animation
      </button>
    </div>
  );
}