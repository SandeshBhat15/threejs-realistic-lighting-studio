import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';

RectAreaLightUniformsLib.init();

// Utility: Convert Kelvin temperature (1000K to 12000K) to Color
export function kelvinToColor(kelvin) {
  const temp = kelvin / 100;
  let red, green, blue;

  if (temp <= 66) {
    red = 255;
    green = Math.min(255, Math.max(0, 99.4708025861 * Math.log(temp) - 161.1195681661));
  } else {
    red = Math.min(255, Math.max(0, 329.698727446 * Math.pow(temp - 60, -0.1332047592)));
    green = Math.min(255, Math.max(0, 288.1221695283 * Math.pow(temp - 60, -0.0755148492)));
  }

  if (temp >= 66) {
    blue = 255;
  } else if (temp <= 19) {
    blue = 0;
  } else {
    blue = Math.min(255, Math.max(0, 138.5177312231 * Math.log(temp - 10) - 305.0447927307));
  }

  return new THREE.Color(`rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`);
}

export class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.showHelpers = false;
    this.helpers = [];

    this.initLights();
  }

  initLights() {
    // Key Light
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    this.keyLight.position.set(5, 7, 5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    const shadowD = 8;
    this.keyLight.shadow.camera.left = -shadowD;
    this.keyLight.shadow.camera.right = shadowD;
    this.keyLight.shadow.camera.top = shadowD;
    this.keyLight.shadow.camera.bottom = -shadowD;
    this.keyLight.shadow.bias = -0.0001;
    this.keyLight.shadow.radius = 3;
    this.scene.add(this.keyLight);

    this.keyLightHelper = new THREE.DirectionalLightHelper(this.keyLight, 1, 0xffd700);
    this.keyLightHelper.visible = false;
    this.scene.add(this.keyLightHelper);
    this.helpers.push(this.keyLightHelper);

    // Fill Light
    this.fillLight = new THREE.DirectionalLight(0xe8f0fe, 1.2);
    this.fillLight.position.set(-5, 4, 3);
    this.fillLight.castShadow = false;
    this.scene.add(this.fillLight);

    this.fillLightHelper = new THREE.DirectionalLightHelper(this.fillLight, 0.8, 0x4169e1);
    this.fillLightHelper.visible = false;
    this.scene.add(this.fillLightHelper);
    this.helpers.push(this.fillLightHelper);

    // Rim Light
    this.rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    this.rimLight.position.set(0, 6, -6);
    this.rimLight.castShadow = false;
    this.scene.add(this.rimLight);

    this.rimLightHelper = new THREE.DirectionalLightHelper(this.rimLight, 0.8, 0xff69b4);
    this.rimLightHelper.visible = false;
    this.scene.add(this.rimLightHelper);
    this.helpers.push(this.rimLightHelper);

    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    // Hemisphere Light
    this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    this.hemisphereLight.position.set(0, 10, 0);
    this.scene.add(this.hemisphereLight);

    this.hemiLightHelper = new THREE.HemisphereLightHelper(this.hemisphereLight, 1);
    this.hemiLightHelper.visible = false;
    this.scene.add(this.hemiLightHelper);
    this.helpers.push(this.hemiLightHelper);

    // Softbox Left
    this.softboxLeft = new THREE.RectAreaLight(0xffffff, 3.0, 4, 4);
    this.softboxLeft.position.set(-4, 3, 2);
    this.softboxLeft.lookAt(0, 1, 0);
    this.scene.add(this.softboxLeft);

    this.softboxLeftHelper = new RectAreaLightHelper(this.softboxLeft);
    this.softboxLeftHelper.visible = false;
    this.scene.add(this.softboxLeftHelper);
    this.helpers.push(this.softboxLeftHelper);

    // Softbox Right
    this.softboxRight = new THREE.RectAreaLight(0xfffaed, 2.0, 4, 4);
    this.softboxRight.position.set(4, 3, 2);
    this.softboxRight.lookAt(0, 1, 0);
    this.scene.add(this.softboxRight);

    this.softboxRightHelper = new RectAreaLightHelper(this.softboxRight);
    this.softboxRightHelper.visible = false;
    this.scene.add(this.softboxRightHelper);
    this.helpers.push(this.softboxRightHelper);
  }

  setLightKelvin(lightName, kelvin) {
    const col = kelvinToColor(kelvin);
    if (lightName === 'key') this.keyLight.color.copy(col);
    else if (lightName === 'fill') this.fillLight.color.copy(col);
    else if (lightName === 'rim') this.rimLight.color.copy(col);
  }

  setHelpersVisible(visible) {
    this.showHelpers = visible;
    this.helpers.forEach(helper => {
      helper.visible = visible;
      if (helper.update) helper.update();
    });
  }

  updateHelpers() {
    if (this.showHelpers) {
      this.helpers.forEach(helper => {
        if (helper.update) helper.update();
      });
    }
  }

  applyLightingConfig(config) {
    if (!config) return;

    if (config.keyLight) {
      this.keyLight.visible = config.keyLight.enabled !== false;
      this.keyLight.color.set(config.keyLight.color);
      this.keyLight.intensity = config.keyLight.intensity;
      if (config.keyLight.position) this.keyLight.position.fromArray(config.keyLight.position);
      this.keyLight.castShadow = config.keyLight.castShadow !== false;
      if (config.keyLight.shadowBias !== undefined) this.keyLight.shadow.bias = config.keyLight.shadowBias;
      if (config.keyLight.shadowRadius !== undefined) this.keyLight.shadow.radius = config.keyLight.shadowRadius;
    }

    if (config.fillLight) {
      this.fillLight.visible = config.fillLight.enabled !== false;
      this.fillLight.color.set(config.fillLight.color);
      this.fillLight.intensity = config.fillLight.intensity;
      if (config.fillLight.position) this.fillLight.position.fromArray(config.fillLight.position);
    }

    if (config.rimLight) {
      this.rimLight.visible = config.rimLight.enabled !== false;
      this.rimLight.color.set(config.rimLight.color);
      this.rimLight.intensity = config.rimLight.intensity;
      if (config.rimLight.position) this.rimLight.position.fromArray(config.rimLight.position);
    }

    if (config.ambientLight) {
      this.ambientLight.color.set(config.ambientLight.color);
      this.ambientLight.intensity = config.ambientLight.intensity;
    }

    if (config.hemisphereLight) {
      this.hemisphereLight.visible = config.hemisphereLight.enabled !== false;
      this.hemisphereLight.color.set(config.hemisphereLight.skyColor);
      this.hemisphereLight.groundColor.set(config.hemisphereLight.groundColor);
      this.hemisphereLight.intensity = config.hemisphereLight.intensity;
    }

    if (config.softboxLeft) {
      this.softboxLeft.visible = config.softboxLeft.enabled !== false;
      this.softboxLeft.color.set(config.softboxLeft.color);
      this.softboxLeft.intensity = config.softboxLeft.intensity;
      this.softboxLeft.width = config.softboxLeft.width || 4;
      this.softboxLeft.height = config.softboxLeft.height || 4;
      if (config.softboxLeft.position) {
        this.softboxLeft.position.fromArray(config.softboxLeft.position);
        this.softboxLeft.lookAt(0, 1, 0);
      }
    }

    if (config.softboxRight) {
      this.softboxRight.visible = config.softboxRight.enabled !== false;
      this.softboxRight.color.set(config.softboxRight.color);
      this.softboxRight.intensity = config.softboxRight.intensity;
      this.softboxRight.width = config.softboxRight.width || 4;
      this.softboxRight.height = config.softboxRight.height || 4;
      if (config.softboxRight.position) {
        this.softboxRight.position.fromArray(config.softboxRight.position);
        this.softboxRight.lookAt(0, 1, 0);
      }
    }

    this.updateHelpers();
  }
}
