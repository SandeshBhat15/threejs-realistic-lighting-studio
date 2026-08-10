// Presets for studio lighting and environment setups

export const PRESETS = {
  studioNeutral: {
    name: 'Studio Neutral',
    icon: 'sun',
    description: 'Clean balanced studio setup ideal for product showcase',
    lighting: {
      keyLight: { enabled: true, color: '#ffffff', intensity: 2.5, position: [5, 7, 5], castShadow: true, shadowMapSize: 2048, shadowBias: -0.0001, shadowRadius: 3 },
      fillLight: { enabled: true, color: '#e8f0fe', intensity: 1.2, position: [-5, 4, 3] },
      rimLight: { enabled: true, color: '#ffffff', intensity: 1.8, position: [0, 6, -6] },
      ambientLight: { color: '#ffffff', intensity: 0.4 },
      hemisphereLight: { enabled: true, skyColor: '#ffffff', groundColor: '#444444', intensity: 0.5 },
      softboxLeft: { enabled: true, color: '#ffffff', intensity: 3.0, width: 4, height: 4, position: [-4, 3, 2] },
      softboxRight: { enabled: true, color: '#fffaed', intensity: 2.0, width: 4, height: 4, position: [4, 3, 2] }
    },
    environment: {
      preset: 'studio',
      bgType: 'color',
      bgColor: '#14171d',
      bluriness: 0.2,
      intensity: 1.0,
      rotation: 0
    },
    ground: {
      showShadowCatcher: true,
      shadowOpacity: 0.45,
      showFloor: true,
      floorColor: '#1c2029',
      floorRoughness: 0.4,
      floorMetalness: 0.1,
      showGrid: false
    },
    postProcessing: {
      toneMapping: 'ACESFilmic',
      exposure: 1.1,
      bloomEnabled: true,
      bloomThreshold: 0.85,
      bloomStrength: 0.3,
      bloomRadius: 0.4
    }
  },

  cinematicDark: {
    name: 'Dramatic Cinematic',
    icon: 'film',
    description: 'High-contrast rim lighting with moody shadows and subtle neon accent',
    lighting: {
      keyLight: { enabled: true, color: '#ffb74d', intensity: 3.5, position: [6, 5, 4], castShadow: true, shadowMapSize: 2048, shadowBias: -0.0001, shadowRadius: 5 },
      fillLight: { enabled: true, color: '#29b6f6', intensity: 1.8, position: [-6, 2, -2] },
      rimLight: { enabled: true, color: '#ff4081', intensity: 4.5, position: [0, 8, -6] },
      ambientLight: { color: '#0a0d14', intensity: 0.15 },
      hemisphereLight: { enabled: true, skyColor: '#1a237e', groundColor: '#000000', intensity: 0.3 },
      softboxLeft: { enabled: false, color: '#29b6f6', intensity: 2.0, width: 3, height: 3, position: [-5, 3, 0] },
      softboxRight: { enabled: true, color: '#ff4081', intensity: 3.5, width: 3, height: 3, position: [5, 4, -4] }
    },
    environment: {
      preset: 'city',
      bgType: 'color',
      bgColor: '#07090e',
      bluriness: 0.5,
      intensity: 0.6,
      rotation: 45
    },
    ground: {
      showShadowCatcher: true,
      shadowOpacity: 0.7,
      showFloor: true,
      floorColor: '#0d1117',
      floorRoughness: 0.15,
      floorMetalness: 0.8,
      showGrid: true
    },
    postProcessing: {
      toneMapping: 'ACESFilmic',
      exposure: 1.25,
      bloomEnabled: true,
      bloomThreshold: 0.65,
      bloomStrength: 0.6,
      bloomRadius: 0.6
    }
  },

  goldenHour: {
    name: 'Golden Hour Sunset',
    icon: 'sunrise',
    description: 'Warm natural outdoor sun with soft golden atmospheric glow',
    lighting: {
      keyLight: { enabled: true, color: '#ffaa44', intensity: 4.0, position: [8, 4, 6], castShadow: true, shadowMapSize: 2048, shadowBias: -0.0001, shadowRadius: 4 },
      fillLight: { enabled: true, color: '#64b5f6', intensity: 1.5, position: [-6, 5, 2] },
      rimLight: { enabled: true, color: '#ffd54f', intensity: 2.5, position: [-3, 6, -7] },
      ambientLight: { color: '#ffe0b2', intensity: 0.35 },
      hemisphereLight: { enabled: true, skyColor: '#ffe0b2', groundColor: '#3e2723', intensity: 0.6 },
      softboxLeft: { enabled: false, color: '#ffffff', intensity: 1.0, width: 4, height: 4, position: [-4, 3, 2] },
      softboxRight: { enabled: false, color: '#ffffff', intensity: 1.0, width: 4, height: 4, position: [4, 3, 2] }
    },
    environment: {
      preset: 'sunset',
      bgType: 'gradient',
      bgColor: '#1c1326',
      bluriness: 0.3,
      intensity: 1.4,
      rotation: 120
    },
    ground: {
      showShadowCatcher: true,
      shadowOpacity: 0.5,
      showFloor: true,
      floorColor: '#1a1625',
      floorRoughness: 0.6,
      floorMetalness: 0.05,
      showGrid: false
    },
    postProcessing: {
      toneMapping: 'ACESFilmic',
      exposure: 1.0,
      bloomEnabled: true,
      bloomThreshold: 0.75,
      bloomStrength: 0.4,
      bloomRadius: 0.5
    }
  },

  cyberpunkNeon: {
    name: 'Cyberpunk Neon',
    icon: 'zap',
    description: 'Vivid dual pink & cyan neon light sources with high reflection floor',
    lighting: {
      keyLight: { enabled: true, color: '#00f0ff', intensity: 3.5, position: [-5, 4, 4], castShadow: true, shadowMapSize: 2048, shadowBias: -0.0001, shadowRadius: 4 },
      fillLight: { enabled: true, color: '#ff0055', intensity: 3.5, position: [5, 4, 4] },
      rimLight: { enabled: true, color: '#7000ff', intensity: 4.0, position: [0, 7, -5] },
      ambientLight: { color: '#050014', intensity: 0.2 },
      hemisphereLight: { enabled: true, skyColor: '#00f0ff', groundColor: '#ff0055', intensity: 0.4 },
      softboxLeft: { enabled: true, color: '#00f0ff', intensity: 4.0, width: 4, height: 4, position: [-4, 3, 0] },
      softboxRight: { enabled: true, color: '#ff0055', intensity: 4.0, width: 4, height: 4, position: [4, 3, 0] }
    },
    environment: {
      preset: 'night',
      bgType: 'color',
      bgColor: '#05030a',
      bluriness: 0.6,
      intensity: 0.8,
      rotation: 90
    },
    ground: {
      showShadowCatcher: true,
      shadowOpacity: 0.6,
      showFloor: true,
      floorColor: '#0a0514',
      floorRoughness: 0.08,
      floorMetalness: 0.95,
      showGrid: true
    },
    postProcessing: {
      toneMapping: 'ACESFilmic',
      exposure: 1.15,
      bloomEnabled: true,
      bloomThreshold: 0.5,
      bloomStrength: 0.8,
      bloomRadius: 0.7
    }
  },

  materialInspection: {
    name: 'Material CAD Inspection',
    icon: 'search',
    description: 'Flat ultra-clear studio lighting designed for analyzing mesh geometry & PBR textures',
    lighting: {
      keyLight: { enabled: true, color: '#ffffff', intensity: 2.0, position: [0, 10, 5], castShadow: true, shadowMapSize: 4096, shadowBias: -0.00005, shadowRadius: 1 },
      fillLight: { enabled: true, color: '#ffffff', intensity: 1.5, position: [-8, 2, 8] },
      rimLight: { enabled: true, color: '#ffffff', intensity: 1.5, position: [8, 2, -8] },
      ambientLight: { color: '#ffffff', intensity: 0.6 },
      hemisphereLight: { enabled: true, skyColor: '#ffffff', groundColor: '#888888', intensity: 0.6 },
      softboxLeft: { enabled: false, color: '#ffffff', intensity: 2.0, width: 4, height: 4, position: [-4, 3, 2] },
      softboxRight: { enabled: false, color: '#ffffff', intensity: 2.0, width: 4, height: 4, position: [4, 3, 2] }
    },
    environment: {
      preset: 'neutral',
      bgType: 'color',
      bgColor: '#222630',
      bluriness: 0.0,
      intensity: 1.0,
      rotation: 0
    },
    ground: {
      showShadowCatcher: true,
      shadowOpacity: 0.3,
      showFloor: true,
      floorColor: '#2b303c',
      floorRoughness: 0.8,
      floorMetalness: 0.0,
      showGrid: true
    },
    postProcessing: {
      toneMapping: 'Linear',
      exposure: 1.0,
      bloomEnabled: false,
      bloomThreshold: 0.9,
      bloomStrength: 0.1,
      bloomRadius: 0.2
    }
  }
};
