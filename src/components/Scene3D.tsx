import { memo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PresentationControls, Float, Environment } from '@react-three/drei'
import { Component, type ErrorInfo, type ReactNode } from 'react'

// Error Boundary for 3D Canvas
class CanvasErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('3D Canvas error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#1a1a2e] via-[#0a0a0a] to-black" />
      )
    }
    return this.props.children
  }
}

function SparkleParticles() {
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 0.5) * 3,
            Math.cos(i * 0.3) * 2,
            Math.sin(i * 0.7) * 2 - 2,
          ]}
          scale={0.07}
        >
          <sphereGeometry />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#ff0080' : '#00ff9d'}
            emissive={i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#ff0080' : '#00ff9d'}
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </>
  )
}

function CentralCrystal() {
  return (
    <mesh position={[3.5, 0.5, -1]} rotation={[0.5, 0.3, 0]}>
      <octahedronGeometry args={[0.6, 0]} />
      <meshPhysicalMaterial
        color="#8b5cf6"
        emissive="#8b5cf6"
        emissiveIntensity={0.2}
        metalness={0.9}
        roughness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

function FloatingRings() {
  return (
    <mesh position={[-3, -0.5, -1.5]} rotation={[Math.PI / 4, 0, 0]}>
      <torusGeometry args={[0.5, 0.05, 16, 100]} />
      <meshStandardMaterial
        color="#00f0ff"
        emissive="#00f0ff"
        emissiveIntensity={0.3}
        metalness={1}
        roughness={0.2}
      />
    </mesh>
  )
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#00f0ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff0080" />

      <PresentationControls
        global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-1, 0.75]}
        config={{ mass: 2, tension: 400 }}
        snap={{ mass: 4, tension: 400, clamp: true, duration: 1.5 }}
      >
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <SparkleParticles />
          <CentralCrystal />
          <FloatingRings />
        </Float>
      </PresentationControls>

      <Environment preset="city" />
    </>
  )
}

// Loading fallback for 3D scene
function SceneLoader() {
  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#1a1a2e] via-[#0a0a0a] to-black" />
  )
}

const Scene3D = memo(function Scene3D() {
  return (
    <CanvasErrorBoundary>
      <Suspense fallback={<SceneLoader />}>
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          dpr={[1, 2]}
          frameloop="demand"
          role="img"
          aria-label="Decorative 3D sparkle animation"
        >
          <SceneContent />
        </Canvas>
      </Suspense>
    </CanvasErrorBoundary>
  )
})

export default Scene3D
