// src/components/SortingVisualizer.jsx

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SortingAnimationLogic } from "./arrayAnimations/SortingAnimationLogic";

export default function SortingVisualizer({ step }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const barsRef = useRef([]);
  const animationLogicRef = useRef(null);
  const [stepInfo, setStepInfo] = useState("");

  // 🌌 Setup scene - runs once on mount
  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize animation logic
    animationLogicRef.current = new SortingAnimationLogic();

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 100, 200);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 8, 28);

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

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Accent lights
    const pointLight1 = new THREE.PointLight(0x8b5cf6, 0.7);
    pointLight1.position.set(-20, 12, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 0.7);
    pointLight2.position.set(20, 12, 10);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x06b6d4, 0.5);
    pointLight3.position.set(0, 15, 20);
    scene.add(pointLight3);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = false;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    // Grid
    const gridHelper = new THREE.GridHelper(80, 40, 0x334155, 0x1e293b);
    gridHelper.position.y = -1;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Render loop
    let lastTime = Date.now();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const now = Date.now();
      const deltaTime = now - lastTime;
      lastTime = now;

      // Update animations
      if (animationLogicRef.current) {
        animationLogicRef.current.updateAnimations(deltaTime);
        animationLogicRef.current.animateBarsRotation(barsRef);
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
  }, []);

  // Update on step change
  useEffect(() => {
    if (!sceneRef.current || !step || !animationLogicRef.current) {
      console.log("Missing dependencies for sorting visualization:", {
        hasScene: !!sceneRef.current,
        hasStep: !!step,
        hasLogic: !!animationLogicRef.current,
      });
      return;
    }

    // Debug: Log the step
    console.log("Sorting step:", step);

    // Set step info
    setStepInfo(step?.description || "");

    // Check if step has array (sorting problem indicator)
    const hasArray = step?.array && Array.isArray(step.array) && step.array.length > 0;

    console.log("Has array:", hasArray);

    if (hasArray) {
      console.log("Updating sorting visualization...");
      animationLogicRef.current.updateSortingVisualization(
        sceneRef.current,
        step,
        barsRef
      );
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
