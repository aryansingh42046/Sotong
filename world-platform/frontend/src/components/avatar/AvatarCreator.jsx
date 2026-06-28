import { useState } from 'react';
import AvatarCanvas from './AvatarCanvas.jsx';
import { useAvatarStore, DEFAULT_AVATAR } from '../../stores/avatarStore.js';

const SECTION = ({ title, children }) => (
  <div className="mb-4">
    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">{title}</p>
    {children}
  </div>
);

const Swatches = ({ options, value, onChange, colorMap }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(o => (
      <button
        key={o}
        onClick={() => onChange(o)}
        title={o}
        className={`px-2 py-1 rounded text-xs capitalize border transition-all ${value === o ? 'border-indigo-400 bg-indigo-500/30 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
        style={colorMap?.[o] ? { borderLeftColor: colorMap[o], borderLeftWidth: 3 } : {}}
      >
        {o}
      </button>
    ))}
  </div>
);

const HAIR_COLORS_MAP = { black: '#1a1a1a', brown: '#6b3f1e', blonde: '#f5d35e', red: '#c0392b', white: '#f0f0f0', pink: '#f06292', blue: '#1976d2' };
const SKIN_COLORS_MAP = { light: '#fde8d0', medium: '#d4a574', tan: '#c68642', dark: '#6b3f1e' };

export default function AvatarCreator({ onSave, onCancel }) {
  const { createAvatar } = useAvatarStore();
  const [config, setConfig] = useState({ ...DEFAULT_AVATAR });
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('My Avatar');
  const [error, setError] = useState('');

  const set = (path, value) => {
    setConfig(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const avatar = await createAvatar({ ...config, name });
      onSave?.(avatar);
    } catch (err) {
      setError(err.message || 'Failed to create avatar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Preview */}
      <div className="flex flex-col items-center gap-4 min-w-36">
        <div className="glass rounded-2xl p-4 flex flex-col items-center gap-3">
          <AvatarCanvas config={config} size={128} />
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-transparent border-b border-gray-600 text-center text-sm text-white w-full outline-none"
            placeholder="Avatar name"
          />
        </div>
        {error && <p className="w-full text-center text-xs text-red-400">{error}</p>}
        <div className="flex gap-2 w-full">
          <button onClick={onCancel} className="flex-1 py-2 text-xs rounded-lg border border-gray-700 text-gray-400 hover:border-gray-500">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1">
        <SECTION title="Skin Tone">
          <Swatches options={['light', 'medium', 'tan', 'dark']} value={config.skinTone} onChange={v => set('skinTone', v)} colorMap={SKIN_COLORS_MAP} />
        </SECTION>
        <SECTION title="Hair Style">
          <Swatches options={['short', 'long', 'curly', 'spiky', 'straight', 'wavy']} value={config.hairStyle} onChange={v => set('hairStyle', v)} />
        </SECTION>
        <SECTION title="Hair Color">
          <Swatches options={['black', 'brown', 'blonde', 'red', 'white', 'pink', 'blue']} value={config.hairColor} onChange={v => set('hairColor', v)} colorMap={HAIR_COLORS_MAP} />
        </SECTION>
        <SECTION title="Eyes">
          <div className="space-y-2">
            <Swatches options={['round', 'almond', 'small', 'large']} value={config.facialFeatures?.eyesShape} onChange={v => set('facialFeatures.eyesShape', v)} />
            <Swatches options={['brown', 'blue', 'green', 'black', 'purple']} value={config.facialFeatures?.eyesColor} onChange={v => set('facialFeatures.eyesColor', v)} />
          </div>
        </SECTION>
        <SECTION title="Mouth">
          <Swatches options={['smile', 'neutral', 'surprised']} value={config.facialFeatures?.mouth} onChange={v => set('facialFeatures.mouth', v)} />
        </SECTION>
        <SECTION title="Top">
          <Swatches options={['tshirt', 'shirt', 'hoodie', 'jacket', 'sweater']} value={config.clothing?.top} onChange={v => set('clothing.top', v)} />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Color:</span>
            <input type="color" value={config.clothing?.topColor || '#6366f1'} onChange={e => set('clothing.topColor', e.target.value)} className="w-7 h-7 cursor-pointer rounded" />
          </div>
        </SECTION>
        <SECTION title="Bottom">
          <Swatches options={['jeans', 'shorts', 'skirt', 'pants', 'leggings']} value={config.clothing?.bottom} onChange={v => set('clothing.bottom', v)} />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Color:</span>
            <input type="color" value={config.clothing?.bottomColor || '#1e3a5f'} onChange={e => set('clothing.bottomColor', e.target.value)} className="w-7 h-7 cursor-pointer rounded" />
          </div>
        </SECTION>
        <SECTION title="Accessories">
          <p className="text-xs text-gray-500 mb-1">Hat</p>
          <Swatches options={['none', 'cap', 'beanie', 'crown']} value={config.accessories?.hat} onChange={v => set('accessories.hat', v)} />
          <p className="text-xs text-gray-500 mb-1 mt-2">Glasses</p>
          <Swatches options={['none', 'sunglasses', 'frames', 'goggles']} value={config.accessories?.glasses} onChange={v => set('accessories.glasses', v)} />
          <p className="text-xs text-gray-500 mb-1 mt-2">Backpack</p>
          <Swatches options={['no', 'yes']} value={config.accessories?.backpack} onChange={v => set('accessories.backpack', v)} />
        </SECTION>
      </div>
    </div>
  );
}
