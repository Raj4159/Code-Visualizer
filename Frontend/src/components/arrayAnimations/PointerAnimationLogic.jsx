import * as THREE from "three";

export class PointerAnimationLogic {
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

  // Get easing function
  easeFunction(t, type = "easeInOutCubic") {
    return (this.easings[type] || this.easings.easeInOutCubic)(
      Math.min(1, Math.max(0, t))
    );
  }

  // Update all animations
  updateAnimations(deltaTime) {
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
  }

  // Create 3D Text sprite
  createText3D(text, size = 1, color = 0xffffff) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // ctx.fillStyle = "#000000";
    // ctx.fillRect(0, 0, 512, 512);

    ctx.font = `bold 200px 'Inter', Arial`;
    ctx.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(size, size, 1);
    return sprite;
  }

  // Create block for array element
  createBlock(value, index, arrayIndex) {
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const material = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.15,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Add edge highlight
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x818cf8, linewidth: 3 })
    );
    mesh.add(wireframe);

    // Position based on array with increased vertical spacing
    const xPos = index * 3.5 - 5.25;
    const yPos = arrayIndex * 7 - 3.5;
    mesh.position.set(xPos, yPos, 0);

    // Store metadata
    mesh.userData = {
      value,
      index,
      arrayIndex,
      isActive: false,
      isPointer: false,
    };

    // Add text label
    const label = this.createText3D(value.toString(), 1.8, 0xffffff);
    label.position.z = 1.3;
    mesh.add(label);

    return mesh;
  }

  // Create pointer with visual feedback
  createPointer(name, color = 0xff6b6b) {
    const group = new THREE.Group();

    // Arrow head
    const headGeometry = new THREE.ConeGeometry(0.5, 1.2, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.8,
      metalness: 0.6,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.6;
    head.rotation.x = Math.PI / 2;
    group.add(head);

    // Arrow shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.6, 16);
    const shaftMaterial = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.6,
    });
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = -0.4;
    group.add(shaft);

    // Glow ring
    const ringGeometry = new THREE.TorusGeometry(1.2, 0.2, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = -0.8;
    ring.rotation.x = Math.PI / 2.5;
    group.add(ring);

    // Pointer label
    const label = this.createText3D(name, 0.8, color);
    label.position.y = 1.6;
    group.add(label);

    group.userData = { name, color, isAnimating: false };

    return group;
  }

  // Highlight block
  highlightBlock(block, isActive) {
    if (isActive) {
      block.material.emissiveIntensity = 0.8;
      block.material.emissive.setHex(0xfbbf24);
      block.material.color.setHex(0xfbbf24);
      this.addAnimation(
        block,
        { scale: { x: 1.15, y: 1.15, z: 1.15 } },
        600,
        "easeOutElastic"
      );
    } else {
      block.material.emissiveIntensity = 0.15;
      block.material.emissive.setHex(0x4f46e5);
      block.material.color.setHex(0x6366f1);
      this.addAnimation(
        block,
        { scale: { x: 1, y: 1, z: 1 } },
        600,
        "easeInOutCubic"
      );
    }
  }

  // Update visualization for pointer algorithms
  updatePointerVisualization(scene, step, blocksRef, pointersRef) {
    // Clear old blocks and pointers from scene
    blocksRef.current.forEach((block) => {
      scene.remove(block);
      if (block.geometry) block.geometry.dispose();
      if (block.material) block.material.dispose();
    });
    
    pointersRef.current.forEach((pointer) => {
      scene.remove(pointer);
      // Recursively dispose pointer group children
      pointer.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    });

    blocksRef.current = [];
    pointersRef.current = [];
    
    // Clear animation queue for fresh start
    this.clearAnimations();

    if (!step || !step.arrays) return;

    // Create blocks for all arrays
    step.arrays.forEach((arrayData, arrayIndex) => {
      const arr = arrayData.values || [];
      const highlights = arrayData.highlights || [];

      arr.forEach((value, index) => {
        const block = this.createBlock(value, index, arrayIndex);
        scene.add(block);
        blocksRef.current.push(block);

        // Highlight if in active indices
        if (highlights.includes(index)) {
          this.highlightBlock(block, true);
        }
      });
    });

    // Create pointers
    if (step.pointers && step.pointers.length > 0) {
      const colors = [0xff6b6b, 0x4ecdc4, 0x4ade80, 0xfbbf24];
      step.pointers.forEach((pointer, pIndex) => {
        const pointerVis = this.createPointer(
          pointer.name,
          colors[pIndex % colors.length]
        );

        // Position pointer above the target block
        const arrayIndex = step.arrays.findIndex(
          (arr) => arr.id === pointer.arrayId
        );
        if (arrayIndex >= 0) {
          const xPos = pointer.index * 3.5 - 5.25;
          const yPos = arrayIndex * 7 - 3.5;
          pointerVis.position.set(xPos, yPos + 4, 0);

          // Animate pointer entrance
          this.addAnimation(
            pointerVis,
            { position: { x: xPos, y: yPos + 3, z: 0 } },
            600,
            "easeOutElastic"
          );
        }

        scene.add(pointerVis);
        pointersRef.current.push(pointerVis);
      });
    }
  }

  // Animate blocks rotation (called in render loop)
  animateBlocksRotation(blocksRef) {
    blocksRef.current.forEach((block) => {
      block.rotation.x += 0.001;
      block.rotation.y += 0.002;
    });
  }

  // Animate pointers (called in render loop)
  animatePointers(pointersRef) {
    pointersRef.current.forEach((pointer) => {
      if (pointer.children[2]) {
        pointer.children[2].rotation.z += 0.02; // Ring rotation
      }
    });
  }
}

export default PointerAnimationLogic;