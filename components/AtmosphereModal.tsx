'use client';

import React, { useState } from 'react';
import {
  AtmosphereData,
  PostProcessingData,
  SkyPreset,
  DEFAULT_ATMOSPHERE,
  DEFAULT_POST_PROCESSING,
} from '../types/atmosphere';
import {
  X,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Sparkles,
  Sliders,
  Eye,
  SlidersHorizontal,
  Flame,
  CloudFog,
} from 'lucide-react';

interface AtmosphereModalProps {
  isOpen: boolean;
  onClose: () => void;
  atmosphere: AtmosphereData;
  postProcessing: PostProcessingData;
  onUpdateAtmosphere: (data: Partial<AtmosphereData>) => void;
  onApplySkyPreset: (preset: SkyPreset) => void;
  onUpdatePostProcessing: (data: Partial<PostProcessingData>) => void;
}

export const AtmosphereModal: React.FC<AtmosphereModalProps> = ({
  isOpen,
  onClose,
  atmosphere,
  postProcessing,
  onUpdateAtmosphere,
  onApplySkyPreset,
  onUpdatePostProcessing,
}) => {
  const [activeTab, setActiveTab] = useState<'sky' | 'fog' | 'postprocess'>('sky');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-16 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Gestionnaire d’Atmosphère & Rendu Post-Processing
              </h2>
              <p className="text-[11px] text-zinc-400">
                Sun/Sky HDR dynamique, Brouillard volumétrique FogExp2, Bloom & Vignette.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-zinc-800/80 bg-zinc-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('sky')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'sky'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Soleil & Ciel (SkyDome)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fog')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'fog'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <CloudFog className="w-3.5 h-3.5" />
            <span>Brouillard (FogExp2)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('postprocess')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              activeTab === 'postprocess'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Post-Processing & Bloom</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: SKY & SUN */}
          {activeTab === 'sky' && (
            <div className="space-y-5">
              {/* Presets Grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                  Préréglages d’Éclairage & Ciel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'daylight', name: 'Plein Jour', icon: Sun, color: 'text-amber-400' },
                    { id: 'golden_hour', name: 'Golden Hour', icon: Sunset, color: 'text-orange-400' },
                    { id: 'sunset', name: 'Crépuscule', icon: Sunset, color: 'text-rose-400' },
                    { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: Sparkles, color: 'text-fuchsia-400' },
                    { id: 'scifi_night', name: 'Nuit Sci-Fi', icon: Moon, color: 'text-indigo-400' },
                    { id: 'overcast', name: 'Ciel Couvert', icon: CloudSun, color: 'text-slate-400' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onApplySkyPreset(preset.id as SkyPreset)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                        atmosphere.skyPreset === preset.id
                          ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <preset.icon className={`w-4 h-4 ${preset.color}`} />
                      <span className="text-xs font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sun Angles */}
              <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                  Position & Trajectoire Solaire
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Azimut (Orientation 360°)</span>
                      <span className="font-mono text-white">{atmosphere.sunPosition.azimuth}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={atmosphere.sunPosition.azimuth}
                      onChange={(e) =>
                        onUpdateAtmosphere({
                          sunPosition: {
                            ...atmosphere.sunPosition,
                            azimuth: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Élévation / Hauteur</span>
                      <span className="font-mono text-white">{atmosphere.sunPosition.elevation}°</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={88}
                      value={atmosphere.sunPosition.elevation}
                      onChange={(e) =>
                        onUpdateAtmosphere({
                          sunPosition: {
                            ...atmosphere.sunPosition,
                            elevation: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>

                {/* Sun Intensity & Colors */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Intensité Solaire</span>
                      <span className="font-mono text-white">{atmosphere.sunIntensity}</span>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={5.0}
                      step={0.1}
                      value={atmosphere.sunIntensity}
                      onChange={(e) => onUpdateAtmosphere({ sunIntensity: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Couleur du Soleil</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={atmosphere.sunColor}
                        onChange={(e) => onUpdateAtmosphere({ sunColor: e.target.value })}
                        className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={atmosphere.sunColor}
                        onChange={(e) => onUpdateAtmosphere({ sunColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FOG */}
          {activeTab === 'fog' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <div className="text-xs font-bold text-white">Activer le Brouillard Volumétrique</div>
                  <div className="text-[11px] text-zinc-400">
                    Fond harmonieusement l&apos;horizon avec le ciel et crée de la profondeur.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={atmosphere.fog.enabled}
                  onChange={(e) =>
                    onUpdateAtmosphere({
                      fog: { ...atmosphere.fog, enabled: e.target.checked },
                    })
                  }
                  className="w-5 h-5 rounded text-sky-500 bg-zinc-950 border-zinc-700"
                />
              </div>

              {atmosphere.fog.enabled && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Type de Brouillard</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateAtmosphere({
                            fog: { ...atmosphere.fog, type: 'exponential' },
                          })
                        }
                        className={`p-2.5 rounded-xl text-xs font-medium border ${
                          atmosphere.fog.type === 'exponential'
                            ? 'bg-sky-500/20 border-sky-500/40 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Exponentiel (FogExp2 - Réaliste)
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateAtmosphere({
                            fog: { ...atmosphere.fog, type: 'linear' },
                          })
                        }
                        className={`p-2.5 rounded-xl text-xs font-medium border ${
                          atmosphere.fog.type === 'linear'
                            ? 'bg-sky-500/20 border-sky-500/40 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Linéaire (Near / Far)
                      </button>
                    </div>
                  </div>

                  {/* Density slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Densité du Brouillard</span>
                      <span className="font-mono text-white">{atmosphere.fog.density}</span>
                    </div>
                    <input
                      type="range"
                      min={0.002}
                      max={0.08}
                      step={0.002}
                      value={atmosphere.fog.density}
                      onChange={(e) =>
                        onUpdateAtmosphere({
                          fog: { ...atmosphere.fog, density: Number(e.target.value) },
                        })
                      }
                      className="w-full accent-sky-500"
                    />
                  </div>

                  {/* Fog Color */}
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Couleur d&apos;Horizon du Brouillard</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={atmosphere.fog.color}
                        onChange={(e) =>
                          onUpdateAtmosphere({
                            fog: { ...atmosphere.fog, color: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                      />
                      <input
                        type="text"
                        value={atmosphere.fog.color}
                        onChange={(e) =>
                          onUpdateAtmosphere({
                            fog: { ...atmosphere.fog, color: e.target.value },
                          })
                        }
                        className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POST PROCESSING */}
          {activeTab === 'postprocess' && (
            <div className="space-y-5">
              {/* Master toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <div className="text-xs font-bold text-white">Activer le Post-Processing EffectComposer</div>
                  <div className="text-[11px] text-zinc-400">
                    Active les passes UnrealBloom, Vignette et Color Grading.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={postProcessing.enabled}
                  onChange={(e) => onUpdatePostProcessing({ enabled: e.target.checked })}
                  className="w-5 h-5 rounded text-purple-500 bg-zinc-950 border-zinc-700"
                />
              </div>

              {postProcessing.enabled && (
                <div className="space-y-5">
                  {/* Unreal Bloom */}
                  <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Unreal Bloom (Éclat Lumineux)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={postProcessing.bloom.enabled}
                        onChange={(e) =>
                          onUpdatePostProcessing({
                            bloom: { ...postProcessing.bloom, enabled: e.target.checked },
                          })
                        }
                        className="rounded text-purple-500 bg-zinc-950 border-zinc-700"
                      />
                    </div>

                    {postProcessing.bloom.enabled && (
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="space-y-1">
                          <div className="text-[10px] text-zinc-400">Intensité</div>
                          <input
                            type="range"
                            min={0.1}
                            max={3.0}
                            step={0.1}
                            value={postProcessing.bloom.strength}
                            onChange={(e) =>
                              onUpdatePostProcessing({
                                bloom: { ...postProcessing.bloom, strength: Number(e.target.value) },
                              })
                            }
                            className="w-full accent-purple-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] text-zinc-400">Rayon (Radius)</div>
                          <input
                            type="range"
                            min={0.1}
                            max={1.5}
                            step={0.05}
                            value={postProcessing.bloom.radius}
                            onChange={(e) =>
                              onUpdatePostProcessing({
                                bloom: { ...postProcessing.bloom, radius: Number(e.target.value) },
                              })
                            }
                            className="w-full accent-purple-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="text-[10px] text-zinc-400">Seuil (Threshold)</div>
                          <input
                            type="range"
                            min={0.0}
                            max={1.0}
                            step={0.05}
                            value={postProcessing.bloom.threshold}
                            onChange={(e) =>
                              onUpdatePostProcessing({
                                bloom: { ...postProcessing.bloom, threshold: Number(e.target.value) },
                              })
                            }
                            className="w-full accent-purple-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vignette & Color Grading */}
                  <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                        <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                        <span>Vignette & Étalonnage Couleur (Color Grading)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <div className="text-[10px] text-zinc-400">Exposition</div>
                        <input
                          type="range"
                          min={0.5}
                          max={2.0}
                          step={0.05}
                          value={postProcessing.colorGrading.exposure}
                          onChange={(e) =>
                            onUpdatePostProcessing({
                              colorGrading: {
                                ...postProcessing.colorGrading,
                                exposure: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full accent-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-zinc-400">Contraste</div>
                        <input
                          type="range"
                          min={0.7}
                          max={1.6}
                          step={0.05}
                          value={postProcessing.colorGrading.contrast}
                          onChange={(e) =>
                            onUpdatePostProcessing({
                              colorGrading: {
                                ...postProcessing.colorGrading,
                                contrast: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full accent-sky-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] text-zinc-400">Saturation</div>
                        <input
                          type="range"
                          min={0.2}
                          max={2.0}
                          step={0.05}
                          value={postProcessing.colorGrading.saturation}
                          onChange={(e) =>
                            onUpdatePostProcessing({
                              colorGrading: {
                                ...postProcessing.colorGrading,
                                saturation: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full accent-sky-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
