import * as THREE from "three";
import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Plane, useAspect, useTexture } from "@react-three/drei";
import Fireflies from "../components/Fireflies";
import {
  EffectComposer,
  DepthOfField,
  Vignette,
} from "@react-three/postprocessing";
import "../materials/layerMaterial";

// const imgUrl =
//   "https://d1agtdz10mk5tb.cloudfront.net/wahed-falafel/public/underconstruction-files/";
const imgUrl = "https://wahedfalafel.ae/";

function Scene({ dof }) {
  const scaleN = useAspect(1600, 1000, 1.05);
  const scaleW = useAspect(2200, 1000, 1.05);
  const textures = useTexture([
    imgUrl + "Asset 3.png",
    imgUrl + "ggg@4x.png",
    imgUrl + "BBB.png",
    imgUrl + "Asset 10@4xddd copy.png",
    imgUrl + "Asset 4.png",
    imgUrl + "Asset 12@4x-8.png",
  ]);
  const subject = useRef();
  const group = useRef();
  const layersRef = useRef([]);
  const [movement] = useState(() => new THREE.Vector3());
  const [temp] = useState(() => new THREE.Vector3());
  const [focus] = useState(() => new THREE.Vector3());
  const layers = [
    { texture: textures[0], z: 0, factor: 0.005, scale: scaleW },
    { texture: textures[1], z: 10, factor: 0.005, scale: scaleW },
    { texture: textures[2], z: 20, scale: scaleW },
    {
      texture: textures[3],
      z: 30,
      ref: subject,
      scaleFactor: 0.83,
      scale: scaleN,
    },
    {
      texture: textures[4],
      factor: 0.03,
      scaleFactor: 1,
      z: 40,
      scale: scaleW,
    },
    {
      texture: textures[5],
      factor: 0.04,
      scaleFactor: 1.1,
      z: 49,
      wiggle: 1,
      scale: scaleW,
    },
  ];

  useFrame((state, delta) => {
    dof.current.target = focus.lerp(subject.current.position, 0.05);
    movement.lerp(temp.set(state.mouse.x, state.mouse.y * 0.2, 0), 0.2);
    group.current.position.x = THREE.MathUtils.lerp(
      group.current.position.x,
      state.mouse.x * 20,
      0.2
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.mouse.y / 10,
      0.2
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      -state.mouse.x / 2,
      0.2
    );
    layersRef.current[4].uniforms.time.value =
      layersRef.current[5].uniforms.time.value += delta;
  }, 1);

  return (
    <group ref={group}>
      <Fireflies count={30} radius={80} colors={["orange"]} />
      {layers.map(
        (
          { scale, texture, ref, factor = 0, scaleFactor = 1, wiggle = 0, z },
          i
        ) => (
          <Plane
            scale={scale}
            args={[1, 1, wiggle ? 10 : 1, wiggle ? 10 : 1]}
            position-z={z}
            key={i}
            ref={ref}
          >
            <layerMaterial
              movement={movement}
              textr={texture}
              factor={factor}
              ref={(el) => (layersRef.current[i] = el)}
              wiggle={wiggle}
              scale={scaleFactor}
            />
          </Plane>
        )
      )}
    </group>
  );
}

const Effects = React.forwardRef((props, ref) => {
  const { viewport: { width, height } } = useThree() // prettier-ignore
  return (
    <EffectComposer multisampling={0}>
      <DepthOfField
        ref={ref}
        bokehScale={4}
        focalLength={0.1}
        width={(width * 5) / 2}
        height={(height * 5) / 2}
      />
      <Vignette />
    </EffectComposer>
  );
});

export default function App() {
  const dof = useRef();
  return (
    <div style={{ height: "100vh" }}>
      <Canvas
        linear
        orthographic
        gl={{ antialias: false, stencil: false, alpha: false, depth: false }}
        camera={{ zoom: 5, position: [0, 0, 200], far: 300, near: 0 }}
      >
        <Suspense fallback={null}>
          <Scene dof={dof} />
        </Suspense>
        <Effects ref={dof} />
      </Canvas>
    </div>
  );
}
