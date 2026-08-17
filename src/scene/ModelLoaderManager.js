import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry.js';

export class ModelLoaderManager {
  constructor(scene, camera, controls, onModelLoaded) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.onModelLoaded = onModelLoaded;

    this.currentModelGroup = new THREE.Group();
    this.currentModelGroup.name = 'CurrentModelGroup';
    this.scene.add(this.currentModelGroup);

    this.baseModel = null;
    this.instanceCount = 1;
    this.instanceSpacing = 3.0;
    this.instanceMixers = [];
    this.originalMaterials = new Map();
    this.meshNodeMap = new Map();
    
    this.animations = [];
    this.selectedClipIndex = 0;
    this.animationMode = 'random_offset'; // 'sync', 'random_offset', 'mixed_clips'
    this.animationSpeed = 1.0;
    this.isPlayingAnimation = true;

    this.materialMode = 'original';
    this.customRoughness = 0.5;
    this.customMetalness = 0.5;

    this.initLoaders();
    this.loadSampleModel('suzanne');
  }

  initLoaders() {
    this.gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    this.gltfLoader.setDRACOLoader(dracoLoader);

    this.objLoader = new OBJLoader();
    this.fbxLoader = new FBXLoader();
    this.stlLoader = new STLLoader();
  }

  clearCurrentModel() {
    if (this.currentModelGroup) {
      while (this.currentModelGroup.children.length > 0) {
        const obj = this.currentModelGroup.children[0];
        this.currentModelGroup.remove(obj);
        obj.traverse((child) => {
          if (child.isMesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        });
      }
    }
    this.baseModel = null;
    this.originalMaterials.clear();
    this.meshNodeMap.clear();
    this.instanceMixers.forEach(m => m.stopAllAction());
    this.instanceMixers = [];
    this.animations = [];
  }

  setupLoadedObject(object, animations = []) {
    this.clearCurrentModel();
    this.baseModel = object;
    this.animations = animations;

    const bbox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 3.5;
    const scale = targetSize / (maxDim || 1);
    object.scale.set(scale, scale, scale);

    const scaledBbox = new THREE.Box3().setFromObject(object);
    const scaledCenter = new THREE.Vector3();
    scaledBbox.getCenter(scaledCenter);

    object.position.x = -scaledCenter.x;
    object.position.y = -scaledBbox.min.y;
    object.position.z = -scaledCenter.z;

    this.rebuildInstances();
  }

  setInstanceCount(count) {
    this.instanceCount = Math.max(1, Math.min(100, count));
    this.rebuildInstances();
  }

  setInstanceSpacing(spacing) {
    this.instanceSpacing = spacing;
    this.rebuildInstances();
  }

  rebuildInstances() {
    if (!this.baseModel) return;

    while (this.currentModelGroup.children.length > 0) {
      this.currentModelGroup.remove(this.currentModelGroup.children[0]);
    }
    this.instanceMixers.forEach(m => m.stopAllAction());
    this.instanceMixers = [];
    this.meshNodeMap.clear();
    this.originalMaterials.clear();

    const cols = Math.ceil(Math.sqrt(this.instanceCount));
    const rows = Math.ceil(this.instanceCount / cols);
    let meshIdCounter = 0;

    for (let i = 0; i < this.instanceCount; i++) {
      const cloneFunc = SkeletonUtils.clone;
      const instance = cloneFunc ? cloneFunc(this.baseModel) : this.baseModel.clone(true);

      const col = i % cols;
      const row = Math.floor(i / cols);
      const offsetX = (col - (cols - 1) / 2) * this.instanceSpacing;
      const offsetZ = (row - (rows - 1) / 2) * this.instanceSpacing;

      instance.position.x = this.baseModel.position.x + offsetX;
      instance.position.y = this.baseModel.position.y;
      instance.position.z = this.baseModel.position.z + offsetZ;

      this.currentModelGroup.add(instance);

      instance.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          const nodeUniqueId = `mesh_inst${i}_${meshIdCounter++}`;
          child.userData.nodeId = nodeUniqueId;
          this.meshNodeMap.set(nodeUniqueId, child);

          if (Array.isArray(child.material)) {
            this.originalMaterials.set(child, child.material.map(m => m.clone()));
          } else if (child.material) {
            this.originalMaterials.set(child, child.material.clone());
          }
        }
      });

      if (this.animations && this.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(instance);
        let clipIdx = this.selectedClipIndex;

        if (this.animationMode === 'mixed_clips') {
          clipIdx = i % this.animations.length;
        }

        const clip = this.animations[clipIdx] || this.animations[0];
        if (clip) {
          const action = mixer.clipAction(clip);
          action.play();

          if (this.animationMode === 'random_offset') {
            action.time = Math.random() * clip.duration;
          }
        }
        this.instanceMixers.push(mixer);
      }
    }

    if (this.materialMode !== 'original') {
      this.setMaterialMode(this.materialMode);
    }

    const baseStats = this.getMeshStats(this.baseModel);
    const subMeshList = this.getSubMeshList();

    if (this.onModelLoaded) {
      this.onModelLoaded({
        name: this.baseModel.name || '3D Model',
        instanceCount: this.instanceCount,
        polyCount: baseStats.triangles * this.instanceCount,
        vertexCount: baseStats.vertices * this.instanceCount,
        basePolyCount: baseStats.triangles,
        animations: this.animations.map(a => a.name || 'Clip'),
        subMeshes: subMeshList
      });
    }
  }

  setAnimationClip(clipIndex) {
    this.selectedClipIndex = clipIndex;
    this.rebuildInstances();
  }

  setAnimationMode(mode) {
    this.animationMode = mode;
    this.rebuildInstances();
  }

  setAnimationSpeed(speed) {
    this.animationSpeed = speed;
    this.instanceMixers.forEach(mixer => {
      mixer.timeScale = speed;
    });
  }

  toggleAnimationPlay() {
    this.isPlayingAnimation = !this.isPlayingAnimation;
    this.instanceMixers.forEach(mixer => {
      mixer.timeScale = this.isPlayingAnimation ? this.animationSpeed : 0;
    });
  }

  getSubMeshList() {
    const list = [];
    this.meshNodeMap.forEach((mesh, id) => {
      let tris = 0;
      if (mesh.geometry) {
        tris = mesh.geometry.index
          ? Math.round(mesh.geometry.index.count / 3)
          : Math.round(mesh.geometry.attributes.position.count / 3);
      }
      list.push({
        id,
        name: mesh.name || `Mesh ${id.replace('mesh_', '')}`,
        visible: mesh.visible,
        triangles: tris
      });
    });
    return list;
  }

  toggleSubMeshVisibility(nodeId, visible) {
    const mesh = this.meshNodeMap.get(nodeId);
    if (mesh) {
      mesh.visible = visible;
    }
  }

  getMeshStats(object) {
    let triangles = 0;
    let vertices = 0;

    object.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const geo = child.geometry;
        if (geo.index) {
          triangles += geo.index.count / 3;
        } else if (geo.attributes.position) {
          triangles += geo.attributes.position.count / 3;
        }
        if (geo.attributes.position) {
          vertices += geo.attributes.position.count;
        }
      }
    });

    return { triangles: Math.round(triangles), vertices };
  }

  loadFromFile(file, onProgress, onError) {
    const fileName = file.name.toLowerCase();
    const url = URL.createObjectURL(file);

    if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.setupLoadedObject(gltf.scene, gltf.animations);
          URL.revokeObjectURL(url);
        },
        onProgress,
        onError
      );
    } else if (fileName.endsWith('.obj')) {
      this.objLoader.load(
        url,
        (obj) => {
          this.setupLoadedObject(obj);
          URL.revokeObjectURL(url);
        },
        onProgress,
        onError
      );
    } else if (fileName.endsWith('.fbx')) {
      this.fbxLoader.load(
        url,
        (fbx) => {
          this.setupLoadedObject(fbx, fbx.animations);
          URL.revokeObjectURL(url);
        },
        onProgress,
        onError
      );
    } else if (fileName.endsWith('.stl')) {
      this.stlLoader.load(
        url,
        (geometry) => {
          geometry.computeVertexNormals();
          const mat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.3, metalness: 0.2 });
          const mesh = new THREE.Mesh(geometry, mat);
          this.setupLoadedObject(mesh);
          URL.revokeObjectURL(url);
        },
        onProgress,
        onError
      );
    } else {
      if (onError) onError(new Error('Unsupported file format. Please upload .glb, .gltf, .obj, .fbx, or .stl'));
    }
  }

  loadSampleModel(type) {
    let mesh;
    let group = new THREE.Group();

    if (type === 'suzanne') {
      const mainGeo = new THREE.TorusKnotGeometry(1.2, 0.4, 128, 32);
      const mainMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.25,
        metalness: 0.4,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1
      });
      mesh = new THREE.Mesh(mainGeo, mainMat);
      mesh.name = 'TorusKnot_Body';
      group.add(mesh);
    } else if (type === 'spheres') {
      group.name = 'PBR Material Test Grid';
      for (let r = 0; r <= 4; r++) {
        for (let m = 0; m <= 4; m++) {
          const geo = new THREE.SphereGeometry(0.35, 32, 32);
          const mat = new THREE.MeshStandardMaterial({
            color: 0xd97706,
            roughness: r / 4,
            metalness: m / 4
          });
          const sphere = new THREE.Mesh(geo, mat);
          sphere.name = `Sphere_R${r}_M${m}`;
          sphere.position.set((r - 2) * 1.0, 0.4, (m - 2) * 1.0);
          group.add(sphere);
        }
      }
    } else if (type === 'teapot') {
      const geo = new TeapotGeometry(1.2, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        roughness: 0.2,
        metalness: 0.6
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.name = 'Utah_Teapot_Mesh';
      group.add(mesh);
    } else if (type === 'car') {
      group.name = 'Stylized Cyber Car';
      const bodyGeo = new THREE.BoxGeometry(3, 0.8, 1.6);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.8 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.name = 'Chassis_Body';
      body.position.y = 0.6;
      group.add(body);

      const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 1.3);
      const cabinMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.1, metalness: 0.9 });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.name = 'Cabin_Glass';
      cabin.position.set(-0.2, 1.2, 0);
      group.add(cabin);

      const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
      const wheelNames = ['Front_Right_Wheel', 'Front_Left_Wheel', 'Rear_Right_Wheel', 'Rear_Left_Wheel'];
      const wheelPositions = [
        [0.9, 0.4, 0.85],
        [0.9, 0.4, -0.85],
        [-0.9, 0.4, 0.85],
        [-0.9, 0.4, -0.85]
      ];
      wheelPositions.forEach((pos, i) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.name = wheelNames[i];
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        group.add(wheel);
      });
    }

    this.setupLoadedObject(group);
  }

  setMaterialMode(mode) {
    this.materialMode = mode;
    if (!this.currentModelGroup) return;

    this.currentModelGroup.traverse((child) => {
      if (child.isMesh) {
        if (mode === 'original') {
          const orig = this.originalMaterials.get(child);
          if (orig) child.material = Array.isArray(orig) ? orig.map(m => m.clone()) : orig.clone();
        } else if (mode === 'clay') {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xeeeeee,
            roughness: 0.7,
            metalness: 0.1
          });
        } else if (mode === 'wireframe') {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            wireframe: true
          });
        } else if (mode === 'normals') {
          child.material = new THREE.MeshNormalMaterial();
        }
      }
    });
  }

  updateCustomPBR(roughness, metalness) {
    this.customRoughness = roughness;
    this.customMetalness = metalness;

    if (!this.currentModelGroup) return;

    this.currentModelGroup.traverse((child) => {
      if (child.isMesh && child.material && child.material.isMeshStandardMaterial) {
        child.material.roughness = roughness;
        child.material.metalness = metalness;
      }
    });
  }

  update(delta) {
    if (this.instanceMixers.length > 0 && this.isPlayingAnimation) {
      this.instanceMixers.forEach(mixer => mixer.update(delta));
    }
  }
}
