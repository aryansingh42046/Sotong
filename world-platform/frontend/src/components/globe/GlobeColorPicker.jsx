const PRESETS = [
  { label: 'Indigo', value: '#1a237e' },
  { label: 'Ocean', value: '#0d3b6e' },
  { label: 'Forest', value: '#1b5e20' },
  { label: 'Crimson', value: '#7f1d1d' },
  { label: 'Violet', value: '#4a1d96' },
  { label: 'Slate', value: '#1e293b' },
];

export default function GlobeColorPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Globe:</span>
      {PRESETS.map(p => (
        <button
          key={p.value}
          title={p.label}
          onClick={() => onChange(p.value)}
          className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            background: p.value,
            borderColor: value === p.value ? '#6366f1' : 'transparent',
          }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
        title="Custom color"
      />
    </div>
  );
}
