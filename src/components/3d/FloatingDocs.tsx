import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'

export function FloatingDocs() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Floating PDF Documents */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Float
          key={i}
          speed={1 + Math.random() * 2}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <mesh
            position={[
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 5,
              (Math.random() - 0.5) * 8
            ]}
            rotation={[
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            ]}
          >
            <boxGeometry args={[0.8, 1.2, 0.05]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#3b82f6' : '#06b6d4'}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}

      {/* Central Logo Text */}
      <Center>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={1}
          height={0.1}
          position={[0, 0, 0]}
        >
          LingoDocs
          <meshStandardMaterial color="#1e40af" />
        </Text3D>
      </Center>

      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </group>
  )
}