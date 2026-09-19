export type SkyPreset =
  | 'daylight'
  | 'sunset'
  | 'golden_hour'
  | 'cyberpunk'
  | 'scifi_night'
  | 'overcast'
  | 'custom';

export type FogType = 'none' | 'linear' | 'exponential';

export interface AtmosphereData {
  skyPreset: SkyPreset;
  sunPosition: { azimuth: number; elevation: number }; // In degrees [0..360, 0..90]
  sunColor: string;
  sunIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  skyTopColor: string;
  skyBottomColor: string;
  groundColor: string;
  fog: {
    enabled: boolean;
    type: FogType;
    color: string;
    density: number; // For FogExp2 [0.001 .. 0.1]
    near: number; // For Linear Fog
    far: number;
  };
}

export interface PostProcessingData {
  enabled: boolean;
  bloom: {
    enabled: boolean;
    strength: number; // [0..3]
    radius: number; // [0..1]
    threshold: number; // [0..1]
  };
  vignette: {
    enabled: boolean;
    darkness: number; // [0..1.5]
    offset: number; // [0..2]
  };
  colorGrading: {
    enabled: boolean;
    exposure: number; // [0.2..3.0]
    contrast: number; // [0.5..2.0]
    saturation: number; // [0..2.0]
  };
  chromaticAberration: {
    enabled: boolean;
    intensity: number; // [0..0.02]
  };
  fxaa: {
    enabled: boolean;
  };
}

export const DEFAULT_ATMOSPHERE: AtmosphereData = {
  skyPreset: 'daylight',
  sunPosition: { azimuth: 45, elevation: 55 },
  sunColor: '#ffffff',
  sunIntensity: 2.0,
  ambientColor: '#ffffff',
  ambientIntensity: 1.5,
  skyTopColor: '#0284c7',
  skyBottomColor: '#38bdf8',
  groundColor: '#12131C',
  fog: {
    enabled: false,
    type: 'none',
    color: '#12131C',
    density: 0.005,
    near: 15,
    far: 120,
  },
};

export const DEFAULT_POST_PROCESSING: PostProcessingData = {
  enabled: false,
  bloom: {
    enabled: false,
    strength: 0.85,
    radius: 0.4,
    threshold: 0.75,
  },
  vignette: {
    enabled: false,
    darkness: 0.9,
    offset: 1.1,
  },
  colorGrading: {
    enabled: false,
    exposure: 1.1,
    contrast: 1.05,
    saturation: 1.1,
  },
  chromaticAberration: {
    enabled: false,
    intensity: 0.003,
  },
  fxaa: {
    enabled: true,
  },
};
