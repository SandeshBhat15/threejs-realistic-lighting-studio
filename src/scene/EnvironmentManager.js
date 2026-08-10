import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export class EnvironmentManager {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    this.rgbeLoader = new RGBELoader();

    this.currentEnvMap = null;
    this.bgType = 'color'; // 'color', 'hdri', 'gradient', 'transparent'
    this.bgColor = '#14171d';
    this.blurriness = 0.2;
    this.intensity = 1.0;
    this.rotation = 0;

    this.hdriMapCache = {};

    this.initDefaultEnvironment();
  }

  initDefaultEnvironment() {
    // Generate high quality neutral room environment map via PMREMGenerator
    const roomEnv = new RoomEnvironment(this.renderer);
    const envTexture = this.pmremGenerator.fromScene(roomEnv, 0.04).texture;
    roomEnv.dispose();

    this.currentEnvMap = envTexture;
    this.scene.environment = envTexture;
    this.updateBackground();
  }

  setBgType(type) {
    this.bgType = type;
    this.updateBackground();
  }

  setBgColor(colorHex) {
    this.bgColor = colorHex;
    if (this.bgType === 'color' || this.bgType === 'gradient') {
      this.updateBackground();
    }
  }

  setBlurriness(val) {
    this.blurriness = val;
    if (this.scene.backgroundBlurriness !== undefined) {
      this.scene.backgroundBlurriness = val;
    }
  }

  setIntensity(val) {
    this.intensity = val;
    if (this.scene.environmentIntensity !== undefined) {
      this.scene.environmentIntensity = val;
    }
    if (this.scene.backgroundIntensity !== undefined) {
      this.scene.backgroundIntensity = val;
    }
  }

  setRotation(angleDegrees) {
    this.rotation = angleDegrees;
    const rad = THREE.MathUtils.degToRad(angleDegrees);
    if (this.scene.environmentRotation !== undefined) {
      this.scene.environmentRotation.set(0, rad, 0);
    }
    if (this.scene.backgroundRotation !== undefined) {
      this.scene.backgroundRotation.set(0, rad, 0);
    }
  }

  updateBackground() {
    if (this.bgType === 'hdri') {
      this.scene.background = this.currentEnvMap;
      this.setBlurriness(this.blurriness);
      this.setIntensity(this.intensity);
    } else if (this.bgType === 'color') {
      this.scene.background = new THREE.Color(this.bgColor);
    } else if (this.bgType === 'transparent') {
      this.scene.background = null;
    } else if (this.bgType === 'gradient') {
      // Dynamic canvas gradient background
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      
      const col = new THREE.Color(this.bgColor);
      const topCol = col.clone().offsetHSL(0, 0, 0.1).getStyle();
      const bottomCol = col.clone().offsetHSL(0, 0, -0.1).getStyle();
      
      gradient.addColorStop(0, topCol);
      gradient.addColorStop(1, bottomCol);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 16, 512);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      this.scene.background = texture;
    }
  }

  loadHDRIFromURL(url, onLoad, onError) {
    if (this.hdriMapCache[url]) {
      this.applyEnvMap(this.hdriMapCache[url]);
      if (onLoad) onLoad();
      return;
    }

    this.rgbeLoader.load(
      url,
      (texture) => {
        const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
        texture.dispose();
        this.hdriMapCache[url] = envMap;
        this.applyEnvMap(envMap);
        if (onLoad) onLoad();
      },
      undefined,
      (err) => {
        console.warn('Failed to load HDRI from URL, keeping current env map', err);
        if (onError) onError(err);
      }
    );
  }

  loadHDRIFromFile(file, onLoad, onError) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      try {
        const texture = this.rgbeLoader.parse(buffer);
        const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
        texture.dispose();
        this.applyEnvMap(envMap);
        if (onLoad) onLoad();
      } catch (err) {
        console.error('Error parsing HDRI file:', err);
        if (onError) onError(err);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  applyEnvMap(envMap) {
    this.currentEnvMap = envMap;
    this.scene.environment = envMap;
    this.updateBackground();
  }

  applyEnvironmentConfig(config) {
    if (!config) return;
    if (config.bgType) this.setBgType(config.bgType);
    if (config.bgColor) this.setBgColor(config.bgColor);
    if (config.bluriness !== undefined) this.setBlurriness(config.bluriness);
    if (config.intensity !== undefined) this.setIntensity(config.intensity);
    if (config.rotation !== undefined) this.setRotation(config.rotation);
  }
}
