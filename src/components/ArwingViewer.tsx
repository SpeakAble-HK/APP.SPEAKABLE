import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

// Update the path to your model and material files as needed
const MODEL_PATH = '/assets/arwing/VSModeArwing.obj';
const MTL_PATH = '/assets/arwing/VSModeArwing.mtl';

type ArwingViewerProps = {
  position?: { x: number; y: number; z: number };
};

const ArwingViewer: React.FC<ArwingViewerProps> = ({ position }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const arwingRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let frameId: number;
    let resizeObserver: ResizeObserver | null = null;

    const getSize = () => {
      const el = mountRef.current;
      return {
        width: Math.max(320, el?.clientWidth || 900),
        height: Math.max(260, el?.clientHeight || 430),
      };
    };

    const initialSize = getSize();
    let width = initialSize.width;
    let height = initialSize.height;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 12);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(8, 12, 10);
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.45);
    fillLight.position.set(-8, 5, -10);
    scene.add(fillLight);

    // Load model
    const mtlLoader = new MTLLoader();
    mtlLoader.load(MTL_PATH, (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.load(MODEL_PATH, (object) => {
        arwingRef.current = object;
        arwingRef.current.scale.set(1.25, 1.25, 1.25);
        // Set initial position if provided
        if (position && arwingRef.current) {
          arwingRef.current.position.set(position.x, position.y, position.z);
        }
        scene.add(arwingRef.current);
      });
    });

    resizeObserver = new ResizeObserver(() => {
      const next = getSize();
      width = next.width;
      height = next.height;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    if (mountRef.current) {
      resizeObserver.observe(mountRef.current);
    }

    // Animation loop
    const animate = () => {
      if (arwingRef.current) {
        arwingRef.current.rotation.y += 0.01;
        if (position) {
          arwingRef.current.position.lerp(new THREE.Vector3(position.x, position.y, position.z), 0.08);
        }
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    // Mount
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      arwingRef.current = null;
    };
  }, [position]);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
};

export default ArwingViewer;
