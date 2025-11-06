import * as THREE from "three";

export class SlidingWindowAnimationLogic {
  constructor() {
    this.animationsQueue = [];
    this.easings = {
      easeInOutCubic: (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      easeOutElastic: (t) => {
        const c5 = (2 * Math.PI) / 4.5;
        return t === 0
          ? 0
          : t === 1
          ? 1
          : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
      },
    };
  }

  // Add animation to queue
  addAnimation(object, target, duration = 600, easing = "easeInOutCubic") {
    const animation = {
      object,
      target,
      duration,
      elapsed: 0,
      start: {
        position: { ...object.position },
        scale: { ...object.scale },
        rotation: { ...object.rotation },
      },
      easing,
    };
    this.animationsQueue.push(animation);
  }

  // Get easing function
  easeFunction(t, type = "easeInOutCubic") {
    const easingFunc = this.easings[type] || this.easings.easeInOutCubic;
    return easingFunc(Math.min(1, Math.max(0, t)));
  }

  // Update all animations
  updateAnimations(deltaTime) {
    for (let i = this.animationsQueue.length - 1; i >= 0; i--) {
      const anim = this.animationsQueue[i];
      anim.elapsed += deltaTime;
      const progress = Math.min(1, anim.elapsed / anim.duration);
      const eased = this.easeFunction(progress, anim.easing);

      if (anim.target.position) {
        const startPos = anim.start.position;
        anim.object.position.x = startPos.x + (anim.target.position.x - startPos.x) * eased;
        anim.object.position.y = startPos.y + (anim.target.position.y - startPos.y) * eased;
        anim.object.position.z = startPos.z + (anim.target.position.z - startPos.z) * eased;
      }

      if (anim.target.scale) {
        const startScale = anim.start.scale;
        anim.object.scale.x = startScale.x + (anim.target.scale.x - startScale.x) * eased;
        anim.object.scale.y = startScale.y + (anim.target.scale.y - startScale.y) * eased;
        anim.object.scale.z = startScale.z + (anim.target.scale.z - startScale.z) * eased;
      }

      if (anim.target.rotation) {
        const startRot = anim.start.rotation;
        anim.object.rotation.x = startRot.x + (anim.target.rotation.x - startRot.x) * eased;
        anim.object.rotation.y = startRot.y + (anim.target.rotation.y - startRot.y) * eased;
        anim.object.rotation.z = startRot.z + (anim.target.rotation.z - startRot.z) * eased;
      }

      if (progress >= 1) {
        this.animationsQueue.splice(i, 1);
      }
    }
  }

  // Clear all animations
  clearAnimations() {
    this.animationsQueue = [];
  }

  // Create 3D Text sprite
  createText3D(text, size = 1, color = 0xffffff) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 512, 512);
    ctx.font = `bold 200px 'Inter', Arial`;
    ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size, size, 1);
    return sprite;
  }

  // Create sphere element with number centered
  createSphere(value, index, arraySize) {
    const radius = 1.5;
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.5,
      roughness: 0.2,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.15,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const xPos = (index - arraySize / 2) * 3.5 + 1.75;
    const yPos = radius;
    mesh.position.set(xPos, yPos, 0);
    mesh.userData = { value, index, originalY: yPos };

    // Add text label CENTERED on sphere
    const label = this.createText3D(value.toString(), 2.5, 0xffffff);
    label.position.set(0, 0, radius + 0.3);
    mesh.add(label);

    return mesh;
  }

  // Highlight sphere if it's inside the window with scale animation
  highlightSphereInWindow(sphere, isInWindow) {
    if (isInWindow) {
      // Yellow for inside window
      sphere.material.color.setHex(0xfbbf24);
      sphere.material.emissive.setHex(0xfbbf24);
      sphere.material.emissiveIntensity = 0.6;
      // Scale up animation
      this.addAnimation(
        sphere,
        { scale: { x: 1.15, y: 1.15, z: 1.15 } },
        600,
        "easeOutElastic"
      );
    } else {
      // Default blue
      sphere.material.color.setHex(0x6366f1);
      sphere.material.emissive.setHex(0x4f46e5);
      sphere.material.emissiveIntensity = 0.15;
      // Scale back
      this.addAnimation(
        sphere,
        { scale: { x: 1, y: 1, z: 1 } },
        400,
        "easeInOutCubic"
      );
    }
    sphere.material.needsUpdate = true;
  }

  // Update visualization for sliding window algorithms
  updateSlidingWindowVisualization(scene, step, spheresRef, windowBoxRef) {
    // Cleanup previous step
    spheresRef.current.forEach((sphere) => {
      scene.remove(sphere);
      if (sphere.geometry) sphere.geometry.dispose();
      if (sphere.material) sphere.material.dispose();
    });
    
    if (windowBoxRef.current) {
      scene.remove(windowBoxRef.current);
      if (windowBoxRef.current.geometry) windowBoxRef.current.geometry.dispose();
      if (windowBoxRef.current.material) windowBoxRef.current.material.dispose();
    }
    
    spheresRef.current = [];
    windowBoxRef.current = null;
    this.clearAnimations();

    if (!step || !step.array) return;

    const arr = step.array;
    const windowIndices = step.window || [];

    // Create spheres for all elements
    arr.forEach((value, index) => {
      const sphere = this.createSphere(value, index, arr.length);
      spheresRef.current.push(sphere);
      scene.add(sphere);

      // Highlight spheres within the window
      const isInWindow = windowIndices.length === 2 && 
                        index >= windowIndices[0] && 
                        index <= windowIndices[1];
      this.highlightSphereInWindow(sphere, isInWindow);
    });

    // Create animated sliding window border
    if (windowIndices.length === 2) {
      const startSphere = spheresRef.current[windowIndices[0]];
      const endSphere = spheresRef.current[windowIndices[1]];

      if (startSphere && endSphere) {
        // Window width calculation
        const windowWidth = (endSphere.position.x - startSphere.position.x) + 3.5;
        const windowHeight = 4.0;
        const windowDepth = 0.1; // Thin border

        // Create FRAME/BORDER instead of solid box
        const frameGeometry = new THREE.BoxGeometry(windowWidth, windowHeight, windowDepth);
        const frameMaterial = new THREE.MeshBasicMaterial({
          color: 0xfbbf24, // Yellow border
          wireframe: true, // Wireframe for visibility
          linewidth: 3,
          transparent: true,
          opacity: 0.8,
        });

        const windowBox = new THREE.Mesh(frameGeometry, frameMaterial);
        const centerX = startSphere.position.x + (windowWidth / 2) - 1.75;
        const centerY = startSphere.position.y;

        windowBox.position.set(centerX, centerY, 0);
        windowBoxRef.current = windowBox;
        scene.add(windowBox);

        // Animate the frame entrance with scale
        windowBox.scale.set(0.85, 0.85, 1);
        this.addAnimation(
          windowBox,
          { scale: { x: 1, y: 1, z: 1 } },
          800,
          "easeOutElastic"
        );
      }
    }
  }

  // Animate spheres rotation
  animateSphereRotation(spheresRef) {
    spheresRef.current.forEach((sphere) => {
      if (sphere.position.y <= sphere.userData.originalY + 0.5) {
        sphere.rotation.x += 0.001;
        sphere.rotation.y += 0.002;
        sphere.rotation.z += 0.0005;
      }
    });
  }
}

export default SlidingWindowAnimationLogic;