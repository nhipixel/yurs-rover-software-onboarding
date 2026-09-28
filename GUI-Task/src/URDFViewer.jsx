import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import URDFLoader from 'urdf-loader';

// The supplied T12 pose is expressed in degrees; URDFLoader expects radians.
const initialJointPositionsInDegrees = {
  AP1: -30,
  AR1: 0,
  HP1: 30,
  HY1: 0,
  KP1: 90,
  KR1: -6.5,
  AP2: -27.8,
  AR2: 1.9,
  HP2: 16.6,
  HY2: 8.5,
  KP2: 118.2,
  KR2: 0,
  AP3: -60,
  AR3: 0,
  HP3: 0,
  HY3: 0,
  KP3: 150,
  KR3: 0,
  AP4: -1.8,
  AR4: 0,
  HP4: 14.1,
  HY4: 0,
  KP4: 121.7,
  KR4: 0,
  AP5: -30,
  AR5: 0,
  HP5: 30,
  HY5: 0,
  KP5: 90,
  KR5: 0,
  AP6: -30,
  AR6: 0,
  HP6: 30,
  HY6: 0,
  KP6: 90,
  KR6: 0,
};

const initialJointPositions = Object.fromEntries(
  Object.entries(initialJointPositionsInDegrees).map(([jointName, degrees]) => [
    jointName,
    THREE.MathUtils.degToRad(degrees),
  ]),
);

function disposeObject(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;

    child.geometry?.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => material?.dispose());
  });
}

function setInitialJointValues(joints) {
  Object.entries(joints).forEach(([jointName, joint]) => {
    if (joint.jointType !== 'revolute' && joint.jointType !== 'prismatic') return;

    const lower = joint.limit?.lower;
    const upper = joint.limit?.upper;
    if (!Number.isFinite(lower) || !Number.isFinite(upper) || lower > upper) {
      console.warn(`Skipping joint with invalid limits: ${joint.name}`);
      return;
    }

    const requestedPosition = initialJointPositions[jointName] ?? 0;
    joint.setJointValue(THREE.MathUtils.clamp(requestedPosition, lower, upper));
  });
}

function clampValue(value, minimum, maximum) {
  const numericValue = Number(value);
  return THREE.MathUtils.clamp(Number.isFinite(numericValue) ? numericValue : minimum, minimum, maximum);
}

export default function URDFViewer({ brightness = 1, zoom = 0.5 }) {
  const containerRef = useRef(null);
  const viewerApiRef = useRef(null);
  const latestSettingsRef = useRef({ brightness, zoom });
  latestSettingsRef.current = { brightness, zoom };

  useEffect(() => {
    viewerApiRef.current?.setBrightness(brightness);
  }, [brightness]);

  useEffect(() => {
    viewerApiRef.current?.setZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    const container = containerRef.current;
    let isDisposed = false;
    let robot;
    let viewerApi;
    let requestedMeshCount = 0;
    let completedMeshCount = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x20242b);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x1b2028, 1.4);
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9fc5ff, 0.8);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x333942, roughness: 0.9, metalness: 0 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;

    function frameModel(model) {
      model.traverse((child) => {
        if (child.isMesh) child.castShadow = true;
      });
      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model);
      floor.position.y = bounds.min.y - 0.01;
      const chassis = model.links.Body;
      const center = chassis
        ? chassis.getWorldPosition(new THREE.Vector3())
        : bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3());
      const largestDimension = Math.max(size.x, size.y, size.z);
      const boundingCorners = [
        new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z),
        new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.max.z),
        new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.min.z),
        new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.max.z),
        new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.min.z),
        new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.max.z),
        new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.min.z),
        new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.max.z),
      ];
      const radius = Math.max(...boundingCorners.map((corner) => corner.distanceTo(center)));
      const distance = (radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.15;
      const initialDistance = distance * 1.1;
      const cameraDirection = new THREE.Vector3(-0.9, 0.65, 1).normalize();
      const panOffset = new THREE.Vector3();
      const maxPanOffset = 2;

      function updateView(zoomDistance = initialDistance) {
        const target = center.clone().add(panOffset);
        controls.target.copy(target);
        camera.position.copy(target).addScaledVector(cameraDirection, zoomDistance);
        camera.updateProjectionMatrix();
        controls.update();
      }

      controls.maxDistance = distance * 3;
      camera.near = Math.max(largestDimension / 100, 0.01);
      camera.far = Math.max(largestDimension * 100, controls.maxDistance + radius * 2);

      const lightIntensities = {
        hemisphere: 1.4,
        key: 3,
        fill: 0.8,
      };
      const minimumZoomDistance = initialDistance * 0.5;
      const maximumZoomDistance = distance * 3;
      let zoomDistance = initialDistance;

      viewerApi = {
        // Range: 0–2
        setBrightness(value) {
          const brightness = clampValue(value, 0, 2);
          hemisphereLight.intensity = lightIntensities.hemisphere * brightness;
          keyLight.intensity = lightIntensities.key * brightness;
          fillLight.intensity = lightIntensities.fill * brightness;
          return brightness;
        },
        // Range: 0–1
        setZoom(value) {
          const normalizedZoom = clampValue(value, 0, 1);
          zoomDistance = THREE.MathUtils.lerp(minimumZoomDistance, maximumZoomDistance, normalizedZoom);
          updateView(zoomDistance);
          return normalizedZoom;
        },
        // Range: -2–2
        setPanX(value) {
          panOffset.x = clampValue(value, -maxPanOffset, maxPanOffset);
          updateView(zoomDistance);
          return panOffset.x;
        },
        // Range: -2–2
        setPanY(value) {
          panOffset.y = clampValue(value, -maxPanOffset, maxPanOffset);
          updateView(zoomDistance);
          return panOffset.y;
        },
        // Range: -2–2
        setPanZ(value) {
          panOffset.z = clampValue(value, -maxPanOffset, maxPanOffset);
          updateView(zoomDistance);
          return panOffset.z;
        },
      };
      viewerApiRef.current = viewerApi;
      updateView();
      viewerApi.setBrightness(latestSettingsRef.current.brightness);
      viewerApi.setZoom(latestSettingsRef.current.zoom);
    }

    const manager = new THREE.LoadingManager();

    const loader = new URDFLoader(manager);
    const defaultMeshLoader = loader.loadMeshCb;
    loader.loadMeshCb = (...args) => {
      requestedMeshCount += 1;
      defaultMeshLoader(args[0], args[1], (...result) => {
        args[2](...result);
        completedMeshCount += 1;
        if (!isDisposed && robot && completedMeshCount === requestedMeshCount) {
          frameModel(robot);
        }
      });
    };
    loader.load(
      '/T12/urdf/T12.URDF',
      (loadedRobot) => {
        if (isDisposed) {
          disposeObject(loadedRobot);
          return;
        }

        setInitialJointValues(loadedRobot.joints);

        // Map T12's model-up direction to the viewer's vertical +Y axis.
        loadedRobot.rotation.x = -Math.PI / 2;
        robot = loadedRobot;
        scene.add(robot);
      },
      undefined,
      (error) => console.error('Unable to load rover URDF:', error),
    );

    function resize() {
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      isDisposed = true;
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      if (robot) disposeObject(robot);
      floor.geometry.dispose();
      floor.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      if (viewerApiRef.current === viewerApi) viewerApiRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="viewer-canvas" />;
}
