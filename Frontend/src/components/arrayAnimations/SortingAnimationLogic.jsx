import * as THREE from "three";

export class SortingAnimationLogic {
  constructor() {
    this.animationsQueue = [];
    this.scheduledAnimations = [];
    this.totalElapsedTime = 0;
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
      easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      },
    };
  }

  // Add animation to queue
  addAnimation(object, target, duration = 800, easing = "easeInOutCubic") {
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

  // Schedule animation using frame-based timing
  scheduleAnimation(object, target, duration, easing, delay) {
    this.scheduledAnimations.push({
      object,
      target,
      duration,
      easing,
      delay,
      started: false,
    });
  }

  // Get easing function
  easeFunction(t, type = "easeInOutCubic") {
    const easingFunc = this.easings[type] || this.easings.easeInOutCubic;
    return easingFunc(Math.min(1, Math.max(0, t)));
  }

  // Update all animations
  updateAnimations(deltaTime) {
    // Update total elapsed time
    this.totalElapsedTime += deltaTime;

    // Check scheduled animations to see if they should start
    for (let i = this.scheduledAnimations.length - 1; i >= 0; i--) {
      const scheduled = this.scheduledAnimations[i];
      if (this.totalElapsedTime >= scheduled.delay && !scheduled.started) {
        // Start this animation
        this.addAnimation(
          scheduled.object,
          scheduled.target,
          scheduled.duration,
          scheduled.easing
        );
        scheduled.started = true;
        this.scheduledAnimations.splice(i, 1);
      }
    }

    // Update active animations
    for (let i = this.animationsQueue.length - 1; i >= 0; i--) {
      const anim = this.animationsQueue[i];
      anim.elapsed += deltaTime;
      const progress = Math.min(1, anim.elapsed / anim.duration);
      const eased = this.easeFunction(progress, anim.easing);

      // Position animation
      if (anim.target.position) {
        const startPos = anim.start.position;
        anim.object.position.x =
          startPos.x + (anim.target.position.x - startPos.x) * eased;
        anim.object.position.y =
          startPos.y + (anim.target.position.y - startPos.y) * eased;
        anim.object.position.z =
          startPos.z + (anim.target.position.z - startPos.z) * eased;
      }

      // Scale animation
      if (anim.target.scale) {
        const startScale = anim.start.scale;
        anim.object.scale.x =
          startScale.x + (anim.target.scale.x - startScale.x) * eased;
        anim.object.scale.y =
          startScale.y + (anim.target.scale.y - startScale.y) * eased;
        anim.object.scale.z =
          startScale.z + (anim.target.scale.z - startScale.z) * eased;
      }

      // Rotation animation
      if (anim.target.rotation) {
        const startRot = anim.start.rotation;
        anim.object.rotation.x =
          startRot.x + (anim.target.rotation.x - startRot.x) * eased;
        anim.object.rotation.y =
          startRot.y + (anim.target.rotation.y - startRot.y) * eased;
        anim.object.rotation.z =
          startRot.z + (anim.target.rotation.z - startRot.z) * eased;
      }

      if (progress >= 1) {
        this.animationsQueue.splice(i, 1);
      }
    }
  }

  // Clear all animations
  clearAnimations() {
    this.animationsQueue = [];
    this.scheduledAnimations = [];
    this.totalElapsedTime = 0;
  }

  // Create 3D Text sprite - NO BACKGROUND, positioned at center
  createText3D(text, size = 1, color = 0xffffff) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Transparent background
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

  // Create larger sphere element for sorting
  createSortSphere(value, index, arraySize) {
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

    // Position: arranged horizontally in a line
    const xPos = (index - arraySize / 2) * 3.5 + 1.75;
    const yPos = radius;
    mesh.position.set(xPos, yPos, 0);

    // Store metadata
    mesh.userData = {
      value,
      index,
      originalY: yPos,
      originalX: xPos,
      state: "default", // Track state to avoid redundant changes
    };

    // Add value text label - CENTERED AT SPHERE CENTER
    const label = this.createText3D(value.toString(), 2.5, 0xffffff);
    label.position.set(0, 0, radius + 0.3); // Center of sphere (mesh local coords)
    mesh.add(label);

    return mesh;
  }

  // Highlight sphere - ALWAYS SET COLOR, don't use addAnimation
  highlightSphere(sphere, state = "default") {
    // Always force set the color and material properties
    if (state === "comparison") {
      sphere.material.emissiveIntensity = 0.8;
      sphere.material.emissive.setHex(0xfbbf24);
      sphere.material.color.setHex(0xfbbf24);
      sphere.userData.state = "comparison";
    } else if (state === "sorted") {
      sphere.material.emissiveIntensity = 0.6;
      sphere.material.emissive.setHex(0x10b981);
      sphere.material.color.setHex(0x10b981);
      sphere.userData.state = "sorted";
    } else {
      sphere.material.emissiveIntensity = 0.15;
      sphere.material.emissive.setHex(0x4f46e5);
      sphere.material.color.setHex(0x6366f1);
      sphere.userData.state = "default";
    }
  }

  // Smooth swap animation with proper frame-based timing
  performSwap(sphere1, sphere2) {
    const sphere1OriginalX = sphere1.position.x;
    const sphere2OriginalX = sphere2.position.x;
    const sphere1OriginalY = sphere1.position.y;
    const sphere2OriginalY = sphere2.position.y;
    const pickupHeight = 10;
    const throwHeight = 15;

    // Phase 1: Pick up both spheres immediately (500ms)
    this.addAnimation(
      sphere1,
      {
        position: { x: sphere1OriginalX, y: pickupHeight, z: 2 },
        scale: { x: 1.1, y: 1.1, z: 1.1 },
        rotation: { x: 0.2, y: 0.3, z: 0 },
      },
      500,
      "easeOutElastic"
    );

    this.addAnimation(
      sphere2,
      {
        position: { x: sphere2OriginalX, y: pickupHeight, z: 2 },
        scale: { x: 1.1, y: 1.1, z: 1.1 },
        rotation: { x: -0.2, y: -0.3, z: 0 },
      },
      500,
      "easeOutElastic"
    );

    // Phase 2: Throw spheres - starts at 550ms (700ms duration)
    this.scheduleAnimation(
      sphere1,
      {
        position: { x: sphere2OriginalX, y: throwHeight, z: 3 },
        rotation: { x: Math.PI * 2, y: Math.PI, z: Math.PI },
      },
      700,
      "easeInOutCubic",
      550
    );

    this.scheduleAnimation(
      sphere2,
      {
        position: { x: sphere1OriginalX, y: throwHeight, z: 3 },
        rotation: { x: -Math.PI * 2, y: -Math.PI, z: -Math.PI },
      },
      700,
      "easeInOutCubic",
      550
    );

    // Phase 3: First bounce - starts at 1350ms (500ms duration)
    this.scheduleAnimation(
      sphere1,
      {
        position: { x: sphere2OriginalX, y: sphere2OriginalY + 2.5, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      500,
      "easeOutBounce",
      1350
    );

    this.scheduleAnimation(
      sphere2,
      {
        position: { x: sphere1OriginalX, y: sphere1OriginalY + 2.5, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      500,
      "easeOutBounce",
      1350
    );

    // Phase 4: Second bounce - starts at 1950ms (400ms duration)
    this.scheduleAnimation(
      sphere1,
      {
        position: { x: sphere2OriginalX, y: sphere2OriginalY + 1.2, z: 0 },
      },
      400,
      "easeOutBounce",
      1950
    );

    this.scheduleAnimation(
      sphere2,
      {
        position: { x: sphere1OriginalX, y: sphere1OriginalY + 1.2, z: 0 },
      },
      400,
      "easeOutBounce",
      1950
    );

    // Phase 5: Final settle - starts at 2450ms (300ms duration)
    this.scheduleAnimation(
      sphere1,
      {
        position: { x: sphere2OriginalX, y: sphere2OriginalY, z: 0 },
      },
      300,
      "easeOutBounce",
      2450
    );

    this.scheduleAnimation(
      sphere2,
      {
        position: { x: sphere1OriginalX, y: sphere1OriginalY, z: 0 },
      },
      300,
      "easeOutBounce",
      2450
    );
  }

  // Update visualization for sorting algorithms
  updateSortingVisualization(scene, step, spheresRef) {
    // Clear old spheres and animations
    spheresRef.current.forEach((sphere) => {
      scene.remove(sphere);
      if (sphere.geometry) sphere.geometry.dispose();
      if (sphere.material) sphere.material.dispose();
    });

    spheresRef.current = [];
    this.clearAnimations();

    if (!step || !step.array) return;

    const arr = step.array;
    const comparingIndices = step.comparing || [];
    const sortedIndices = step.sorted || [];

    // Create spheres for all elements
    arr.forEach((value, index) => {
      const sphere = this.createSortSphere(value, index, arr.length);
      scene.add(sphere);
      spheresRef.current.push(sphere);
    });

    // ALWAYS apply highlighting on every update - no state tracking, just set the color directly
    spheresRef.current.forEach((sphere, idx) => {
      if (sortedIndices.includes(idx)) {
        this.highlightSphere(sphere, "sorted");
      } else if (comparingIndices.includes(idx)) {
        this.highlightSphere(sphere, "comparison");
      } else {
        this.highlightSphere(sphere, "default");
      }
    });

    // Perform swap animation if specified
    if (step.swap && step.swap.length === 2) {
      const [idx1, idx2] = step.swap;
      const sphere1 = spheresRef.current[idx1];
      const sphere2 = spheresRef.current[idx2];

      if (sphere1 && sphere2) {
        this.performSwap(sphere1, sphere2);
      }
    }
  }

  // Animate spheres rotation
  animateSphereRotation(spheresRef) {
    spheresRef.current.forEach((sphere) => {
      // Only rotate if on ground
      if (sphere.position.y <= sphere.userData.originalY + 0.5) {
        sphere.rotation.x += 0.001;
        sphere.rotation.y += 0.002;
        sphere.rotation.z += 0.0005;
      }
    });
  }
}

export default SortingAnimationLogic;