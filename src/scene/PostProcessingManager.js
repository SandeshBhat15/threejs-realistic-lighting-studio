import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export class PostProcessingManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.enabled = true;
    this.bloomEnabled = true;
    this.bloomThreshold = 0.85;
    this.bloomStrength = 0.3;
    this.bloomRadius = 0.4;
    this.toneMappingType = 'ACESFilmic';
    this.exposure = 1.1;

    this.initComposer();
  }

  initComposer() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set renderer default tone mapping
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.exposure;

    this.composer = new EffectComposer(this.renderer);
    
    // 1. Render Pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // 2. Bloom Pass
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      this.bloomStrength,
      this.bloomRadius,
      this.bloomThreshold
    );
    this.bloomPass.enabled = this.bloomEnabled;
    this.composer.addPass(this.bloomPass);

    // 3. Output Pass (Applies tone mapping & sRGB encoding)
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);
  }

  setSize(width, height) {
    this.composer.setSize(width, height);
    this.bloomPass.setSize(width, height);
  }

  setBloomEnabled(enabled) {
    this.bloomEnabled = enabled;
    this.bloomPass.enabled = enabled;
  }

  setBloomThreshold(threshold) {
    this.bloomThreshold = threshold;
    this.bloomPass.threshold = threshold;
  }

  setBloomStrength(strength) {
    this.bloomStrength = strength;
    this.bloomPass.strength = strength;
  }

  setBloomRadius(radius) {
    this.bloomRadius = radius;
    this.bloomPass.radius = radius;
  }

  setExposure(exposure) {
    this.exposure = exposure;
    this.renderer.toneMappingExposure = exposure;
  }

  setToneMapping(type) {
    this.toneMappingType = type;
    switch (type) {
      case 'ACESFilmic':
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        break;
      case 'Reinhard':
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        break;
      case 'Linear':
        this.renderer.toneMapping = THREE.LinearToneMapping;
        break;
      case 'Cineon':
        this.renderer.toneMapping = THREE.CineonToneMapping;
        break;
      case 'AgX':
        this.renderer.toneMapping = THREE.AgXToneMapping || THREE.ACESFilmicToneMapping;
        break;
      case 'Neutral':
        this.renderer.toneMapping = THREE.NeutralToneMapping || THREE.LinearToneMapping;
        break;
      default:
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    }
  }

  applyPostProcessingConfig(config) {
    if (!config) return;
    if (config.toneMapping) this.setToneMapping(config.toneMapping);
    if (config.exposure !== undefined) this.setExposure(config.exposure);
    if (config.bloomEnabled !== undefined) this.setBloomEnabled(config.bloomEnabled);
    if (config.bloomThreshold !== undefined) this.setBloomThreshold(config.bloomThreshold);
    if (config.bloomStrength !== undefined) this.setBloomStrength(config.bloomStrength);
    if (config.bloomRadius !== undefined) this.setBloomRadius(config.bloomRadius);
  }

  render() {
    if (this.enabled) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
