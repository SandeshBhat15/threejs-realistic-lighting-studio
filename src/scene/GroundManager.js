import * as THREE from 'three';

export class GroundManager {
  constructor(scene) {
    this.scene = scene;

    this.showShadowCatcher = true;
    this.shadowOpacity = 0.45;
    this.showFloor = true;
    this.floorColor = '#1c2029';
    this.floorRoughness = 0.4;
    this.floorMetalness = 0.1;
    this.showGrid = false;
    this.groundY = 0;

    this.initGround();
  }

  initGround() {
    this.groundGroup = new THREE.Group();
    this.groundGroup.name = 'GroundGroup';
    this.scene.add(this.groundGroup);

    // 1. Shadow Catcher Plane
    const shadowGeo = new THREE.PlaneGeometry(100, 100);
    this.shadowMaterial = new THREE.ShadowMaterial({
      opacity: this.shadowOpacity,
      color: 0x000000
    });
    this.shadowCatcher = new THREE.Mesh(shadowGeo, this.shadowMaterial);
    this.shadowCatcher.rotation.x = -Math.PI / 2;
    this.shadowCatcher.position.y = 0.001; // Slightly above floor plane to avoid Z-fighting
    this.shadowCatcher.receiveShadow = true;
    this.shadowCatcher.visible = this.showShadowCatcher;
    this.groundGroup.add(this.shadowCatcher);

    // 2. Reflective PBR Floor Plane
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.floorColor),
      roughness: this.floorRoughness,
      metalness: this.floorMetalness,
      side: THREE.FrontSide
    });
    this.floorPlane = new THREE.Mesh(floorGeo, this.floorMaterial);
    this.floorPlane.rotation.x = -Math.PI / 2;
    this.floorPlane.position.y = 0;
    this.floorPlane.receiveShadow = true;
    this.floorPlane.visible = this.showFloor;
    this.groundGroup.add(this.floorPlane);

    // 3. Grid Helper
    this.gridHelper = new THREE.GridHelper(40, 40, 0x4488ff, 0x334455);
    this.gridHelper.position.y = 0.002;
    this.gridHelper.visible = this.showGrid;
    this.groundGroup.add(this.gridHelper);
  }

  setGroundY(y) {
    this.groundY = y;
    this.groundGroup.position.y = y;
  }

  setShowShadowCatcher(show) {
    this.showShadowCatcher = show;
    this.shadowCatcher.visible = show;
  }

  setShadowOpacity(opacity) {
    this.shadowOpacity = opacity;
    this.shadowMaterial.opacity = opacity;
  }

  setShowFloor(show) {
    this.showFloor = show;
    this.floorPlane.visible = show;
  }

  setFloorColor(colorHex) {
    this.floorColor = colorHex;
    this.floorMaterial.color.set(colorHex);
  }

  setFloorRoughness(roughness) {
    this.floorRoughness = roughness;
    this.floorMaterial.roughness = roughness;
  }

  setFloorMetalness(metalness) {
    this.floorMetalness = metalness;
    this.floorMaterial.metalness = metalness;
  }

  setShowGrid(show) {
    this.showGrid = show;
    this.gridHelper.visible = show;
  }

  applyGroundConfig(config) {
    if (!config) return;
    if (config.showShadowCatcher !== undefined) this.setShowShadowCatcher(config.showShadowCatcher);
    if (config.shadowOpacity !== undefined) this.setShadowOpacity(config.shadowOpacity);
    if (config.showFloor !== undefined) this.setShowFloor(config.showFloor);
    if (config.floorColor) this.setFloorColor(config.floorColor);
    if (config.floorRoughness !== undefined) this.setFloorRoughness(config.floorRoughness);
    if (config.floorMetalness !== undefined) this.setFloorMetalness(config.floorMetalness);
    if (config.showGrid !== undefined) this.setShowGrid(config.showGrid);
  }
}
