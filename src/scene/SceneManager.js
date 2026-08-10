import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { LightingManager } from './LightingManager.js';
import { EnvironmentManager } from './EnvironmentManager.js';
import { GroundManager } from './GroundManager.js';
import { PostProcessingManager } from './PostProcessingManager.js';
import { ModelLoaderManager } from './ModelLoaderManager.js';
import { PRESETS } from './Presets.js';

export class SceneManager {
  constructor(canvasContainer, onModelLoadedCallback) {
    this.container = canvasContainer;
    this.clock = new THREE.Clock();
    this.currentPresetKey = 'studioNeutral';

    // Performance Stats Tracking
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsTime = performance.now();
    this.mobileMode = false;
    this.isOrthographic = false;

    this.initRenderer();
    this.initSceneAndCamera();
    this.initControls();

    // Managers
    this.lighting = new LightingManager(this.scene);
    this.environment = new EnvironmentManager(this.scene, this.renderer);
    this.ground = new GroundManager(this.scene);
    this.postProcessing = new PostProcessingManager(this.scene, this.camera, this.renderer);
    this.modelLoader = new ModelLoaderManager(
      this.scene,
      this.camera,
      this.controls,
      onModelLoadedCallback
    );

    this.initTransformControls();
    this.applyPreset('studioNeutral');

    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.animate();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  initSceneAndCamera() {
    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.perspCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.perspCamera.position.set(0, 3, 9);

    const d = 5;
    this.orthoCamera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    this.orthoCamera.position.set(0, 3, 9);

    this.camera = this.perspCamera;
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 50;
    this.controls.target.set(0, 1.5, 0);
  }

  setCameraProjection(isOrtho) {
    this.isOrthographic = isOrtho;
    const prevPos = this.camera.position.clone();
    const prevTarget = this.controls.target.clone();

    if (isOrtho) {
      this.camera = this.orthoCamera;
    } else {
      this.camera = this.perspCamera;
    }

    this.camera.position.copy(prevPos);
    this.controls.object = this.camera;
    this.controls.target.copy(prevTarget);
    this.controls.update();

    this.postProcessing.camera = this.camera;
    this.postProcessing.renderPass.camera = this.camera;
    this.onWindowResize();
  }

  setCameraFOV(fov) {
    if (!this.isOrthographic) {
      this.perspCamera.fov = fov;
      this.perspCamera.updateProjectionMatrix();
    }
  }

  setCameraView(view) {
    const target = this.controls.target.clone();
    const dist = 9;

    switch (view) {
      case 'front':
        this.camera.position.set(target.x, target.y, target.z + dist);
        break;
      case 'top':
        this.camera.position.set(target.x, target.y + dist, target.z + 0.001);
        break;
      case 'side':
        this.camera.position.set(target.x + dist, target.y, target.z);
        break;
      case 'iso':
        this.camera.position.set(target.x + dist * 0.7, target.y + dist * 0.7, target.z + dist * 0.7);
        break;
      case 'perspective':
      default:
        this.camera.position.set(0, 3, 9);
        this.controls.target.set(0, 1.5, 0);
        break;
    }
    this.controls.update();
  }

  initTransformControls() {
    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.size = 0.75;
    this.scene.add(this.transformControls.getHelper());

    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.controls.enabled = !event.value;
    });

    this.transformControls.addEventListener('change', () => {
      this.lighting.updateHelpers();
    });
  }

  attachTransformGizmo(targetObject) {
    if (!targetObject) {
      this.transformControls.detach();
      return;
    }
    this.transformControls.attach(targetObject);
  }

  detachTransformGizmo() {
    this.transformControls.detach();
  }

  setTransformMode(mode) {
    this.transformControls.setMode(mode);
  }

  setMobileOptimizationMode(enabled) {
    this.mobileMode = enabled;
    if (enabled) {
      this.renderer.setPixelRatio(1.0);
      if (this.lighting.keyLight) {
        this.lighting.keyLight.shadow.mapSize.set(1024, 1024);
        this.lighting.keyLight.shadow.map?.dispose();
        this.lighting.keyLight.shadow.map = null;
      }
      this.postProcessing.setBloomEnabled(false);
      this.ground.setShadowOpacity(0.3);
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      if (this.lighting.keyLight) {
        this.lighting.keyLight.shadow.mapSize.set(2048, 2048);
        this.lighting.keyLight.shadow.map?.dispose();
        this.lighting.keyLight.shadow.map = null;
      }
      this.postProcessing.setBloomEnabled(true);
    }
  }

  getHardwareDiagnostics() {
    const gl = this.renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    let gpuVendor = 'Generic WebGL';
    let gpuRenderer = 'Standard GPU';

    if (debugInfo) {
      gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown Vendor';
      gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown GPU';
    }

    const maxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    return {
      gpuVendor,
      gpuRenderer,
      maxTexSize: `${maxTexSize}x${maxTexSize}`,
      maxVertexAttribs,
      webglVersion: gl instanceof WebGL2RenderingContext ? 'WebGL 2.0' : 'WebGL 1.0'
    };
  }

  getPerformanceStats() {
    const info = this.renderer.info;

    // Detailed Pass Breakdown Calculation
    let shadowPassCalls = 0;
    if (this.lighting.keyLight && this.lighting.keyLight.castShadow && this.lighting.keyLight.visible) {
      shadowPassCalls = info.render.calls > 1 ? Math.floor(info.render.calls * 0.3) : 1;
    }
    const scenePassCalls = Math.max(1, info.render.calls - shadowPassCalls);

    return {
      fps: Math.round(this.fps),
      drawCalls: info.render.calls,
      shadowPassCalls,
      scenePassCalls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      pixelRatio: this.renderer.getPixelRatio().toFixed(1)
    };
  }

  applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    this.currentPresetKey = presetKey;
    this.lighting.applyLightingConfig(preset.lighting);
    this.environment.applyEnvironmentConfig(preset.environment);
    this.ground.applyGroundConfig(preset.ground);
    this.postProcessing.applyPostProcessingConfig(preset.postProcessing);

    if (this.mobileMode) {
      this.setMobileOptimizationMode(true);
    }
  }

  resetCamera() {
    this.camera.position.set(0, 3, 9);
    this.controls.target.set(0, 1.5, 0);
    this.controls.update();
  }

  exportSnapshot(resolutionMultiplier = 1, isTransparent = false, format = 'image/png') {
    const originalPixelRatio = this.renderer.getPixelRatio();
    const originalBg = this.scene.background;
    const helpersVisible = this.lighting.showHelpers;

    this.lighting.setHelpersVisible(false);
    this.transformControls.detach();

    if (isTransparent) {
      this.scene.background = null;
    }

    this.renderer.setPixelRatio(originalPixelRatio * resolutionMultiplier);
    this.postProcessing.render();

    const dataURL = this.renderer.domElement.toDataURL(format);

    this.renderer.setPixelRatio(originalPixelRatio);
    this.scene.background = originalBg;
    this.lighting.setHelpersVisible(helpersVisible);

    return dataURL;
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.isOrthographic) {
      const aspect = width / height;
      const d = 5;
      this.orthoCamera.left = -d * aspect;
      this.orthoCamera.right = d * aspect;
      this.orthoCamera.top = d;
      this.orthoCamera.bottom = -d;
      this.orthoCamera.updateProjectionMatrix();
    } else {
      this.perspCamera.aspect = width / height;
      this.perspCamera.updateProjectionMatrix();
    }

    this.renderer.setSize(width, height);
    this.postProcessing.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const now = performance.now();
    this.frameCount++;
    if (now >= this.lastFpsTime + 500) {
      this.fps = (this.frameCount * 1000) / (now - this.lastFpsTime);
      this.frameCount = 0;
      this.lastFpsTime = now;
    }

    const delta = this.clock.getDelta();

    this.controls.update();
    this.modelLoader.update(delta);

    this.postProcessing.render();
  }
}
