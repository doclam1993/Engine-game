'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings2, 
  Play, 
  Pause, 
  Car, 
  Accessibility, 
  Dog, 
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { SceneNode, RigAnimData } from '../types/engine';

interface RigStudioModalProps {
  isOpen: boolean;
  node: SceneNode | null;
  onSave: (data: RigAnimData) => void;
  onClose: () => void;
  availableAnimations: string[];
  childNodeNames: string[];
}

export const RigStudioModal: React.FC<RigStudioModalProps> = ({
  isOpen,
  node,
  onSave,
  onClose,
  availableAnimations,
  childNodeNames
}) => {
  const [config, setConfig] = useState<RigAnimData>(() => {
    return node?.rigAnim || {
      enabled: true,
      rigType: 'biped',
      animationMapping: {},
      autoAnimate: true,
      vehicleWheels: {}
    };
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (node?.rigAnim) {
      setConfig(node.rigAnim);
    } else {
      setConfig({
        enabled: true,
        rigType: 'biped',
        animationMapping: {},
        autoAnimate: true,
        vehicleWheels: {}
      });
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSave = () => {
    onSave(config);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const updateMapping = (key: keyof RigAnimData['animationMapping'], value: string) => {
    setConfig(prev => ({
      ...prev,
      animationMapping: {
        ...prev.animationMapping,
        [key]: value
      }
    }));
  };

  const updateWheel = (key: keyof NonNullable<RigAnimData['vehicleWheels']>, value: string) => {
    setConfig(prev => ({
      ...prev,
      vehicleWheels: {
        ...(prev.vehicleWheels || {}),
        [key]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#222]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Animation & Rig Studio</h2>
              <p className="text-xs text-white/40">Configure rigging behavior and automated animation sets</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Rig Type Selection */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-white/30 flex items-center gap-2">
              <Settings2 className="w-3 h-3" /> Type de Rig & Comportement
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 'biped', label: 'Humanoïde', icon: Accessibility },
                { id: 'quadruped', label: 'Animal', icon: Dog },
                { id: 'vehicle', label: 'Véhicule', icon: Car },
                { id: 'custom', label: 'Custom', icon: Settings2 },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setConfig(prev => ({ ...prev, rigType: type.id as any }))}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                    config.rigType === type.id 
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-white' 
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <type.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Mapping */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white/30 flex items-center gap-2">
                <Play className="w-3 h-3" /> Mapping des Animations
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40">Auto-blend</span>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, autoAnimate: !prev.autoAnimate }))}
                  className={`w-8 h-4 rounded-full transition-all relative ${config.autoAnimate ? 'bg-indigo-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${config.autoAnimate ? 'left-4.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'idle', label: 'Idle (Repos)' },
                { id: 'walk', label: 'Walk (Marche)' },
                { id: 'run', label: 'Run (Course)' },
                { id: 'sprint', label: 'Sprint (Vitesse)' },
                { id: 'jump', label: 'Jump (Saut)' },
                { id: 'crouch', label: 'Crouch (Accroupi)' },
                { id: 'attack', label: 'Attack (Attaque)' },
                { id: 'interact', label: 'Interact (Action)' },
                { id: 'hit', label: 'Hit (Dégâts)' },
                { id: 'wave', label: 'Wave (Saluer)' },
                { id: 'die', label: 'Die (Mort)' },
              ].map((anim) => (
                <div key={anim.id} className="space-y-1.5">
                  <label className="text-[11px] text-white/60 font-medium px-1">{anim.label}</label>
                  <select
                    value={config.animationMapping[anim.id as keyof RigAnimData['animationMapping']] || ''}
                    onChange={(e) => updateMapping(anim.id as any, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                  >
                    <option value="">(Aucun)</option>
                    {availableAnimations.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            
            {availableAnimations.length === 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3 mt-2">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/70 leading-relaxed">
                  Aucune animation squelettique détectée dans ce modèle. Importez un fichier GLB avec des animations pour configurer le mapping.
                </p>
              </div>
            )}
          </div>

          {/* Vehicle Rigging (Conditional) */}
          {config.rigType === 'vehicle' && (
            <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold uppercase tracking-wider text-white/30 flex items-center gap-2">
                <Car className="w-3 h-3" /> Rigging des Roues (Vehicle)
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'frontLeft', label: 'Avant Gauche' },
                  { id: 'frontRight', label: 'Avant Droite' },
                  { id: 'rearLeft', label: 'Arrière Gauche' },
                  { id: 'rearRight', label: 'Arrière Droite' },
                ].map((wheel) => (
                  <div key={wheel.id} className="space-y-1.5">
                    <label className="text-[11px] text-white/60 font-medium px-1">{wheel.label}</label>
                    <select
                      value={config.vehicleWheels?.[wheel.id as keyof NonNullable<RigAnimData['vehicleWheels']>] || ''}
                      onChange={(e) => updateWheel(wheel.id as any, e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                    >
                      <option value="">(Sélectionner Mesh)</option>
                      {childNodeNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#222] border-t border-white/10 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`px-6 py-2 text-sm font-bold rounded-lg transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
              isSaved 
                ? 'bg-emerald-500 text-white' 
                : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                Configuré !
              </>
            ) : (
              'Appliquer le Rigging'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
