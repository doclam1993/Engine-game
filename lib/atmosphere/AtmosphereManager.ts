import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import {
  AtmosphereData,
  PostProcessingData,
  DEFAULT_ATMOSPHERE,
  DEFAULT_POST_PROCESSING,
  SkyPreset,
} from '../../types/atmosphere';

// Custom Post-Processing Shader (Vignette, ToneMapping, Saturation, Contrast, Chromatic Aberration)
const ColorCorrectionShader = {
  name: 'ColorCorrectionShader',
  uniforms: {
    tDiffuse: { value: null },
    vignetteDarkness: { value: 0.9 },
    vignetteOffset: { value: 1.1 },
    exposure: { value: 1.1 },
    contrast: { value: 1.05 },
    saturation: { value: 1.1 },
    chromaticAberration: { value: 0.0 },
    enableVignette: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float vignetteDarkness;
    uniform float vignetteOffset;
    uniform float exposure;
    uniform float contrast;
    uniform float saturation;
    uniform float chromaticAberration;
    uniform float enableVignette;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      vec4 color;

      if (chromaticAberration > 0.0001) {
        vec2 dist = (uv - 0.5) * chromaticAberration;
        float r = texture2D(tDiffuse, uv + dist).r;
        float g = texture2D(tDiffuse, uv).g;
        float b = texture2D(tDiffuse, uv - dist).b;
        color = vec4(r, g, b, 1.0);
      } else {
        color = texture2D(tDiffuse, uv);
      }

      // Exposure
      vec3 rgb = color.rgb * exposure;

      // Contrast
      rgb = (rgb - 0.5) * contrast + 0.5;

      // Saturation
      float gray = dot(rgb, vec3(0.299, 0.587, 0.114));
      rgb = mix(vec3(gray), rgb, saturation);

      // Vignette
      if (enableVignette > 0.5) {
        vec2 center = uv - vec2(0.5);
        float dist = length(center);
        float vig = smoothstep(0.8, vignetteOffset * 0.799, dist * (vignetteDarkness + 0.5));
        rgb *= clamp(vig, 0.0, 1.0);
      }

      gl_FragColor = vec4(rgb, color.a);
    }
  `,
};

// Sky Dome Vertex & Fragment Shaders
const SkyDomeShader = {
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform vec3 sunColor;
    uniform vec3 sunDirection;
    uniform float sunIntensity;
    varying vec3 vWorldPosition;

    void main() {
      vec3 dir = normalize(vWorldPosition);
      float h = normalize(vWorldPosition).y;
      float factor = max(0.0, h);
      vec3 sky = mix(bottomColor, topColor, pow(factor, 0.6));

      // Sun disc & glow
      float sunDot = max(0.0, dot(dir, normalize(sunDirection)));
      float sunGlow = pow(sunDot, 64.0) * 1.5;
      float sunDisc = smoothstep(0.998, 0.9995, sunDot) * 4.0;
      
      sky += (sunColor * (sunGlow + sunDisc)) * sunIntensity * 0.5;

      gl_FragColor = vec4(sky, 1.0);
    }
  `,
};

export class AtmosphereManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  private skyMesh!: THREE.Mesh;
  private skyMaterial!: THREE.ShaderMaterial;

  public atmosphere: AtmosphereData;
  public postProcessing: PostProcessingData;

  // Post-processing Composer
  public composer: EffectComposer | null = null;
  public bloomPass: UnrealBloomPass | null = null;
  public colorPass: ShaderPass | null = null;
  public renderPass: RenderPass | null = null;

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    renderer: THREE.WebGLRenderer,
    dirLight: THREE.DirectionalLight,
    ambientLight: THREE.AmbientLight,
    initialAtmosphere?: AtmosphereData,
    initialPostProcessing?: PostProcessingData
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.dirLight = dirLight;
    this.ambientLight = ambientLight;

    this.atmosphere = initialAtmosphere ? { ...initialAtmosphere } : { ...DEFAULT_ATMOSPHERE };
    this.postProcessing = initialPostProcessing
      ? { ...initialPostProcessing }
      : { ...DEFAULT_POST_PROCESSING };

    this.initSky();
    this.initPostProcessing();
    this.applyAtmosphere(this.atmosphere);
    this.applyPostProcessing(this.postProcessing);
  }

  private initSky(): void {
    const skyGeo = new THREE.SphereGeometry(450, 32, 24);
    this.skyMaterial = new THREE.ShaderMaterial({
      vertexShader: SkyDomeShader.vertexShader,
      fragmentShader: SkyDomeShader.fragmentShader,
      uniforms: {
        topColor: { value: new THREE.Color(this.atmosphere.skyTopColor) },
        bottomColor: { value: new THREE.Color(this.atmosphere.skyBottomColor) },
        sunColor: { value: new THREE.Color(this.atmosphere.sunColor) },
        sunDirection: { value: new THREE.Vector3(0, 1, 0) },
        sunIntensity: { value: this.atmosphere.sunIntensity },
      },
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });

    this.skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial);
    this.skyMesh.name = '__AETHER_SKY_DOME__';
    this.scene.add(this.skyMesh);
  }

  public initPostProcessing(): void {
    const size = this.renderer.getSize(new THREE.Vector2());
    const pixelRatio = this.renderer.getPixelRatio();

    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(size.x, size.y);
    this.composer.setPixelRatio(pixelRatio);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // 1. Unreal Bloom Pass
    const bloom = this.postProcessing.bloom;
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.x, size.y),
      bloom.strength,
      bloom.radius,
      bloom.threshold
    );
    this.bloomPass.enabled = bloom.enabled;
    this.composer.addPass(this.bloomPass);

    // 2. Color Correction & Vignette Pass
    this.colorPass = new ShaderPass(ColorCorrectionShader);
    this.updateColorPassUniforms();
    this.composer.addPass(this.colorPass);

    // 3. Final Output Pass
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  private updateColorPassUniforms(): void {
    if (!this.colorPass) return;
    const pp = this.postProcessing;
    const u = this.colorPass.uniforms;

    u.vignetteDarkness.value = pp.vignette.darkness;
    u.vignetteOffset.value = pp.vignette.offset;
    u.exposure.value = pp.colorGrading.exposure;
    u.contrast.value = pp.colorGrading.contrast;
    u.saturation.value = pp.colorGrading.saturation;
    u.chromaticAberration.value = pp.chromaticAberration.enabled
      ? pp.chromaticAberration.intensity
      : 0;
    u.enableVignette.value = pp.vignette.enabled ? 1.0 : 0.0;
  }

  public setSize(width: number, height: number): void {
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
  }

  public applyAtmosphere(data: Partial<AtmosphereData>): void {
    this.atmosphere = { ...this.atmosphere, ...data };
    const atm = this.atmosphere;

    // 1. Calculate Sun Position from Azimuth & Elevation
    const azimuthRad = THREE.MathUtils.degToRad(atm.sunPosition.azimuth);
    const elevationRad = THREE.MathUtils.degToRad(atm.sunPosition.elevation);
    const radius = 25;

    const sunX = radius * Math.cos(elevationRad) * Math.sin(azimuthRad);
    const sunY = radius * Math.sin(elevationRad);
    const sunZ = radius * Math.cos(elevationRad) * Math.cos(azimuthRad);

    this.dirLight.position.set(sunX, sunY, sunZ);
    this.dirLight.color.set(atm.sunColor);
    this.dirLight.intensity = atm.sunIntensity;

    // 2. Ambient light
    this.ambientLight.color.set(atm.ambientColor);
    this.ambientLight.intensity = atm.ambientIntensity;

    // 3. Sky Dome Uniforms
    if (this.skyMaterial) {
      this.skyMaterial.uniforms.topColor.value.set(atm.skyTopColor);
      this.skyMaterial.uniforms.bottomColor.value.set(atm.skyBottomColor);
      this.skyMaterial.uniforms.sunColor.value.set(atm.sunColor);
      this.skyMaterial.uniforms.sunDirection.value.set(sunX, sunY, sunZ).normalize();
      this.skyMaterial.uniforms.sunIntensity.value = atm.sunIntensity;
    }

    // 4. Fog
    if (atm.fog.enabled) {
      if (atm.fog.type === 'exponential') {
        this.scene.fog = new THREE.FogExp2(atm.fog.color, Math.min(atm.fog.density, 0.008));
      } else if (atm.fog.type === 'linear') {
        this.scene.fog = new THREE.Fog(atm.fog.color, Math.max(atm.fog.near, 15), Math.max(atm.fog.far, 120));
      } else {
        this.scene.fog = null;
      }
    } else {
      this.scene.fog = null;
    }

    // Background color: if sky dome mesh is active, keep background clean for sky dome render
    if (this.skyMesh && this.skyMesh.visible) {
      this.scene.background = null;
    } else {
      this.scene.background = new THREE.Color(atm.fog.color);
    }
  }

  public updateAtmosphere(data: Partial<AtmosphereData>): void {
    this.applyAtmosphere(data);
  }

  public updatePostProcessing(data: Partial<PostProcessingData>): void {
    this.applyPostProcessing(data);
  }

  public applyPreset(preset: SkyPreset): void {
    let update: Partial<AtmosphereData> = { skyPreset: preset };

    switch (preset) {
      case 'daylight':
        update = {
          skyPreset: 'daylight',
          sunPosition: { azimuth: 45, elevation: 55 },
          sunColor: '#fff8eb',
          sunIntensity: 2.2,
          ambientColor: '#ffffff',
          ambientIntensity: 0.75,
          skyTopColor: '#0284c7',
          skyBottomColor: '#7dd3fc',
          groundColor: '#0f172a',
          fog: {
            enabled: true,
            type: 'exponential',
            color: '#0c0e14',
            density: 0.012,
            near: 10,
            far: 100,
          },
        };
        break;

      case 'sunset':
        update = {
          skyPreset: 'sunset',
          sunPosition: { azimuth: 260, elevation: 12 },
          sunColor: '#ff6b35',
          sunIntensity: 3.2,
          ambientColor: '#818cf8',
          ambientIntensity: 0.6,
          skyTopColor: '#311042',
          skyBottomColor: '#f97316',
          groundColor: '#180e29',
          fog: {
            enabled: true,
            type: 'exponential',
            color: '#240b36',
            density: 0.02,
            near: 10,
            far: 75,
          },
        };
        break;

      case 'golden_hour':
        update = {
          skyPreset: 'golden_hour',
          sunPosition: { azimuth: 235, elevation: 22 },
          sunColor: '#fbbf24',
          sunIntensity: 2.8,
          ambientColor: '#fed7aa',
          ambientIntensity: 0.7,
          skyTopColor: '#0369a1',
          skyBottomColor: '#fde047',
          groundColor: '#1c1917',
          fog: {
            enabled: true,
            type: 'exponential',
            color: '#1e1b18',
            density: 0.015,
            near: 15,
            far: 90,
          },
        };
        break;

      case 'cyberpunk':
        update = {
          skyPreset: 'cyberpunk',
          sunPosition: { azimuth: 180, elevation: 18 },
          sunColor: '#ec4899',
          sunIntensity: 2.5,
          ambientColor: '#06b6d4',
          ambientIntensity: 0.8,
          skyTopColor: '#090514',
          skyBottomColor: '#701a75',
          groundColor: '#020617',
          fog: {
            enabled: true,
            type: 'exponential',
            color: '#090214',
            density: 0.022,
            near: 5,
            far: 60,
          },
        };
        break;

      case 'scifi_night':
        update = {
          skyPreset: 'scifi_night',
          sunPosition: { azimuth: 0, elevation: 8 },
          sunColor: '#38bdf8',
          sunIntensity: 1.2,
          ambientColor: '#1e1b4b',
          ambientIntensity: 0.5,
          skyTopColor: '#020617',
          skyBottomColor: '#0f172a',
          groundColor: '#020617',
          fog: {
            enabled: true,
            type: 'exponential',
            color: '#020617',
            density: 0.028,
            near: 5,
            far: 50,
          },
        };
        break;

      case 'overcast':
        update = {
          skyPreset: 'overcast',
          sunPosition: { azimuth: 90, elevation: 60 },
          sunColor: '#cbd5e1',
          sunIntensity: 1.4,
          ambientColor: '#94a3b8',
          ambientIntensity: 0.9,
          skyTopColor: '#475569',
          skyBottomColor: '#94a3b8',
          groundColor: '#1e293b',
          fog: {
            enabled: true,
            type: 'exponential',
            color: '#334155',
            density: 0.035,
            near: 5,
            far: 45,
          },
        };
        break;
    }

    this.applyAtmosphere(update);
  }

  public applyPostProcessing(data: Partial<PostProcessingData>): void {
    this.postProcessing = { ...this.postProcessing, ...data };
    const pp = this.postProcessing;

    if (this.bloomPass) {
      this.bloomPass.enabled = pp.enabled && pp.bloom.enabled;
      this.bloomPass.strength = pp.bloom.strength;
      this.bloomPass.radius = pp.bloom.radius;
      this.bloomPass.threshold = pp.bloom.threshold;
    }

    this.updateColorPassUniforms();
  }

  public render(deltaTime: number): void {
    if (this.postProcessing.enabled && this.composer) {
      this.composer.render(deltaTime);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public dispose(): void {
    if (this.skyMesh) {
      this.scene.remove(this.skyMesh);
      this.skyMesh.geometry.dispose();
      this.skyMaterial.dispose();
    }
    if (this.composer) {
      this.composer.dispose();
    }
  }
}
