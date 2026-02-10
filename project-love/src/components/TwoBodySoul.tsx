import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function BinaryStars({ resetTrigger }: { resetTrigger: number }) {
  const star1 = useRef<any>();
  const star2 = useRef<any>();
  const heart = useRef<any>();
  const [phase, setPhase] = React.useState("orbit");
  const timer = useRef(0);

  useFrame((_, delta) => {
    timer.current += delta;

    if (phase === "orbit") {
      const r = Math.max(0.5, 3 - timer.current * 0.5);
      const angle = timer.current * 1.5;

      star1.current.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
      star2.current.position.set(-Math.cos(angle) * r, 0, -Math.sin(angle) * r);

      if (r <= 0.6) {
        setPhase("flash");
        timer.current = 0;
      }
    } else if (phase === "flash") {
      if (timer.current > 1) {
        setPhase("heart");
      }
    } else if (phase === "heart") {
      heart.current.rotation.y += delta;
    }
  });

  React.useEffect(() => {
    setPhase("orbit");
    timer.current = 0;
  }, [resetTrigger]);

  return (
    <>
      {phase !== "heart" && (
        <>
          <mesh ref={star1}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial emissive={"yellow"} color={"orange"} />
          </mesh>
          <mesh ref={star2}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial emissive={"yellow"} color={"orange"} />
          </mesh>
        </>
      )}

      {phase === "flash" && (
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color={"white"} />
        </mesh>
      )}

      {phase === "heart" && (
        <mesh ref={heart}>
          <torusKnotGeometry args={[1.2, 0.4, 100, 16]} />
          <meshStandardMaterial color={"hotpink"} />
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
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} />
        <BinaryStars resetTrigger={reset} />
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