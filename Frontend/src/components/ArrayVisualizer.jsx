import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { PointerAnimationLogic } from "./arrayAnimations/PointerAnimationLogic";
import { SortingAnimationLogic } from "./arrayAnimations/SortingAnimationLogic";
import { SlidingWindowAnimationLogic } from "./arrayAnimations/SlidingWindowAnimationLogic";



export default function ArrayVisualizer({ step }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const blocksRef = useRef([]);
  const pointersRef = useRef([]);
  const spheresRef = useRef([]);
  const windowBoxRef = useRef(null);
  const pointerLogicRef = useRef(null);
  const sortingLogicRef = useRef(null);
  const slidingWindowLogicRef = useRef(null);
  const [stepInfo, setStepInfo] = useState("");
  const [algorithmType, setAlgorithmType] = useState(null);



  // 🌌 Setup scene - runs once on mount
  useEffect(() => {
    if (!mountRef.current) return;



    // Initialize all animation logics
    pointerLogicRef.current = new PointerAnimationLogic();
    sortingLogicRef.current = new SortingAnimationLogic();
    slidingWindowLogicRef.current = new SlidingWindowAnimationLogic();



    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a2332);
    scene.fog = new THREE.Fog(0x1a2332, 80, 150);
    sceneRef.current = scene;



    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 3, 22);



    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;



    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);



    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);



    // Accent lights
    const pointLight1 = new THREE.PointLight(0x8b5cf6, 0.6);
    pointLight1.position.set(-15, 8, 8);
    scene.add(pointLight1);



    const pointLight2 = new THREE.PointLight(0xec4899, 0.6);
    pointLight2.position.set(15, 8, 8);
    scene.add(pointLight2);



    // Additional light for sorting
    const pointLight3 = new THREE.PointLight(0x06b6d4, 0.5);
    pointLight3.position.set(0, 15, 20);
    scene.add(pointLight3);



    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = false;
    controls.minDistance = 15;
    controls.maxDistance = 80;
    controlsRef.current = controls;



    // 3D Cube Surface Grid - ONLY SURFACES, NO INTERIOR
    const gridSize = 180;
    const gridDivisions = 20;
    const gridStep = gridSize / gridDivisions;
    const lineColor = 0x4a5568;
    const points = [];

    // Create only the 6 faces of the cube with grid lines
    
    // Front face (Z = gridSize/2)
    for (let x = -gridSize / 2; x <= gridSize / 2; x += gridStep) {
      points.push(new THREE.Vector3(x, -gridSize / 2, gridSize / 2));
      points.push(new THREE.Vector3(x, gridSize / 2, gridSize / 2));
    }
    for (let y = -gridSize / 2; y <= gridSize / 2; y += gridStep) {
      points.push(new THREE.Vector3(-gridSize / 2, y, gridSize / 2));
      points.push(new THREE.Vector3(gridSize / 2, y, gridSize / 2));
    }

    // Back face (Z = -gridSize/2)
    for (let x = -gridSize / 2; x <= gridSize / 2; x += gridStep) {
      points.push(new THREE.Vector3(x, -gridSize / 2, -gridSize / 2));
      points.push(new THREE.Vector3(x, gridSize / 2, -gridSize / 2));
    }
    for (let y = -gridSize / 2; y <= gridSize / 2; y += gridStep) {
      points.push(new THREE.Vector3(-gridSize / 2, y, -gridSize / 2));
      points.push(new THREE.Vector3(gridSize / 2, y, -gridSize / 2));
    }

    // Left face (X = -gridSize/2)
    for (let z = -gridSize / 2; z <= gridSize / 2; z += gridStep) {
      points.push(new THREE.Vector3(-gridSize / 2, -gridSize / 2, z));
      points.push(new THREE.Vector3(-gridSize / 2, gridSize / 2, z));
    }
    for (let y = -gridSize / 2; y <= gridSize / 2; y += gridStep) {
      points.push(new THREE.Vector3(-gridSize / 2, y, -gridSize / 2));
      points.push(new THREE.Vector3(-gridSize / 2, y, gridSize / 2));
    }

    // Right face (X = gridSize/2)
    for (let z = -gridSize / 2; z <= gridSize / 2; z += gridStep) {
      points.push(new THREE.Vector3(gridSize / 2, -gridSize / 2, z));
      points.push(new THREE.Vector3(gridSize / 2, gridSize / 2, z));
    }
    for (let y = -gridSize / 2; y <= gridSize / 2; y += gridStep) {
      points.push(new THREE.Vector3(gridSize / 2, y, -gridSize / 2));
      points.push(new THREE.Vector3(gridSize / 2, y, gridSize / 2));
    }

    // Top face (Y = gridSize/2)
    for (let x = -gridSize / 2; x <= gridSize / 2; x += gridStep) {
      points.push(new THREE.Vector3(x, gridSize / 2, -gridSize / 2));
      points.push(new THREE.Vector3(x, gridSize / 2, gridSize / 2));
    }
    for (let z = -gridSize / 2; z <= gridSize / 2; z += gridStep) {
      points.push(new THREE.Vector3(-gridSize / 2, gridSize / 2, z));
      points.push(new THREE.Vector3(gridSize / 2, gridSize / 2, z));
    }

    // Bottom face (Y = -gridSize/2)
    for (let x = -gridSize / 2; x <= gridSize / 2; x += gridStep) {
      points.push(new THREE.Vector3(x, -gridSize / 2, -gridSize / 2));
      points.push(new THREE.Vector3(x, -gridSize / 2, gridSize / 2));
    }
    for (let z = -gridSize / 2; z <= gridSize / 2; z += gridStep) {
      points.push(new THREE.Vector3(-gridSize / 2, -gridSize / 2, z));
      points.push(new THREE.Vector3(gridSize / 2, -gridSize / 2, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: lineColor, transparent: true, opacity: 0.25 });
    const cubicGrid = new THREE.LineSegments(geometry, material);
    scene.add(cubicGrid);



    // Render loop
    let lastTime = Date.now();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);



      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;



      // Update animations based on type
      if (algorithmType === "pointer") {
        if (pointerLogicRef.current) {
          pointerLogicRef.current.updateAnimations(deltaTime);
          pointerLogicRef.current.animateBlocksRotation(blocksRef);
          pointerLogicRef.current.animatePointers(pointersRef);
        }
      } else if (algorithmType === "sorting") {
        if (sortingLogicRef.current) {
          sortingLogicRef.current.updateAnimations(deltaTime);
          sortingLogicRef.current.animateSphereRotation(spheresRef);
        }
      } else if (algorithmType === "sliding-window") {
        if (slidingWindowLogicRef.current) {
          slidingWindowLogicRef.current.updateAnimations(deltaTime);
          slidingWindowLogicRef.current.animateSphereRotation(spheresRef);
        }
      }



      controls.update();
      renderer.render(scene, camera);
    };
    animate();



    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);



    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      controls.dispose();
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [algorithmType]);



  // Update on step change
  useEffect(() => {
    if (!sceneRef.current || !step) {
      console.log("Missing dependencies:", {
        hasScene: !!sceneRef.current,
        hasStep: !!step,
      });
      return;
    }



    console.log("Full step object:", step);



    // Set step info
    setStepInfo(step?.description || "");



    // Detect algorithm type
    const hasArrays = step?.arrays && Array.isArray(step.arrays) && step.arrays.length > 0;
    const hasPointers = step?.pointers && Array.isArray(step.pointers) && step.pointers.length > 0;
    const hasSingleArray = step?.array && Array.isArray(step.array) && step.array.length > 0;
    const hasWindow = step?.window && Array.isArray(step.window) && step.window.length === 2;



    console.log("Has arrays:", hasArrays, "Has pointers:", hasPointers, "Has single array:", hasSingleArray, "Has window:", hasWindow);



    // Pointer algorithm (multiple arrays with pointers)
    if (hasArrays && pointerLogicRef.current) {
      console.log("Detected: Pointer Algorithm");
      setAlgorithmType("pointer");
      pointerLogicRef.current.updatePointerVisualization(
        sceneRef.current,
        step,
        blocksRef,
        pointersRef
      );
    }
    // Sliding window algorithm (single array with window range)
    else if (hasSingleArray && hasWindow && slidingWindowLogicRef.current) {
      console.log("Detected: Sliding Window Algorithm");
      setAlgorithmType("sliding-window");
      slidingWindowLogicRef.current.updateSlidingWindowVisualization(
        sceneRef.current,
        step,
        spheresRef,
        windowBoxRef
      );
    }
    // Sorting algorithm (single array to sort)
    else if (hasSingleArray && sortingLogicRef.current) {
      console.log("Detected: Sorting Algorithm");
      setAlgorithmType("sorting");
      sortingLogicRef.current.updateSortingVisualization(
        sceneRef.current,
        step,
        spheresRef
      );
    } else {
      console.log("No algorithm type detected");
    }
  }, [step]);



  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
      <div
        style={{
          padding: "16px",
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          borderRadius: "8px",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          color: "#e2e8f0",
          fontSize: "14px",
          lineHeight: "1.6",
          minHeight: "60px",
        }}
      >
        <strong style={{ color: "#4ade80" }}>Current Step:</strong> {stepInfo || "No step information available"}
      </div>
    </div>
  );
}