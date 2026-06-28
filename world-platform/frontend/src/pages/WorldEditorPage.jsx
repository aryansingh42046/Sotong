import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWorldStore } from '../stores/worldStore.js';

const FLOOR_NAMES = ['Fire', 'Water', 'Earth', 'Air', 'Sky'];

const FURNITURE_TYPES = [
  { type: 'desk', emoji: '🖥', label: 'Desk' },
  { type: 'whiteboard', emoji: '📋', label: 'Whiteboard' },
  { type: 'meeting_room', emoji: '🎙', label: 'Meeting Room' },
  { type: 'tv_screen', emoji: '📺', label: 'TV Screen' },
  { type: 'reception_desk', emoji: '🛎', label: 'Reception' },
];

export default function WorldEditorPage() {
  const { id } = useParams();
  const { currentWorld, fetchWorld, updateWorldDesign } = useWorldStore();
  const [design, setDesign] = useState(null);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [tool, setTool] = useState('room');
  const [roomForm, setRoomForm] = useState({ name: 'New Room', width: 15, height: 10 });
  const [placing, setPlacing] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchWorld(id); }, [id]);

  useEffect(() => {
    if (currentWorld?.worldDesign) {
      const d = currentWorld.worldDesign;
      // Ensure 5 floors
      const floors = [...(d.floors || [])];
      while (floors.length < 5) {
        floors.push({ floorNumber: floors.length + 1, floorName: FLOOR_NAMES[floors.length], gridWidth: 100, gridHeight: 100, rooms: [], furniture: [] });
      }
      setDesign({ ...d, floors });
    }
  }, [currentWorld]);

  const floor = design?.floors?.[currentFloor];

  const handleGridClick = (gx, gy) => {
    if (!floor || !placing) return;
    const newDesign = JSON.parse(JSON.stringify(design));
    const f = newDesign.floors[currentFloor];

    if (placing.kind === 'room') {
      f.rooms.push({ roomId: crypto.randomUUID(), name: roomForm.name, position: { x: gx, y: gy }, size: { width: roomForm.width, height: roomForm.height }, roomType: 'chat', isLocked: false });
    } else if (placing.kind === 'furniture') {
      f.furniture.push({ furnitureId: crypto.randomUUID(), type: placing.furnitureType, furnitureType: placing.furnitureType, position: { x: gx, y: gy }, rotation: 0, interactionType: 'interact' });
    }
    setDesign(newDesign);
  };

  const handleSave = async () => {
    setSaving(true);
    try { await updateWorldDesign(id, design); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    finally { setSaving(false); }
  };

  if (!design || currentWorld?.id !== id) return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0f]">
      <span className="text-gray-400 text-sm animate-pulse">Loading editor…</span>
    </div>
  );

  const GRID_SIZE = 6; // px per grid cell at zoomed-out view
  const VISIBLE_W = 80, VISIBLE_H = 60;

  return (
    <div className="w-full h-full flex bg-[#0a0a0f] overflow-hidden">
      {/* Left panel */}
      <div className="w-56 glass border-r border-white/5 flex flex-col p-3 gap-3 overflow-y-auto">
        <Link to={`/worlds/${id}`} className="text-xs text-gray-500 hover:text-gray-300">← Back</Link>
        <h2 className="font-bold text-white text-sm">World Editor</h2>

        {/* Floor selector */}
        <div>
          <p className="text-xs text-gray-400 mb-1">Floors</p>
          {design.floors.map((f, i) => (
            <button key={i} onClick={() => setCurrentFloor(i)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs mb-1 ${currentFloor === i ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              {i + 1}. {f.floorName}
            </button>
          ))}
        </div>

        {/* Tools */}
        <div>
          <p className="text-xs text-gray-400 mb-1">Tool</p>
          {[{ id: 'room', label: '🏠 Room' }, { id: 'furniture', label: '🪑 Furniture' }].map(t => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs mb-1 ${tool === t.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tool === 'room' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Room Settings</p>
            <input value={roomForm.name} onChange={e => setRoomForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none" placeholder="Room name" />
            <div className="flex gap-2">
              <input type="number" value={roomForm.width} onChange={e => setRoomForm(p => ({ ...p, width: +e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none" min="5" max="50" />
              <input type="number" value={roomForm.height} onChange={e => setRoomForm(p => ({ ...p, height: +e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none" min="5" max="50" />
            </div>
            <button onClick={() => setPlacing({ kind: 'room' })}
              className={`w-full py-1.5 rounded text-xs font-medium ${placing?.kind === 'room' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              {placing?.kind === 'room' ? 'Click on grid to place' : 'Place Room'}
            </button>
          </div>
        )}

        {tool === 'furniture' && (
          <div className="space-y-1">
            <p className="text-xs text-gray-400">Furniture</p>
            {FURNITURE_TYPES.map(f => (
              <button key={f.type} onClick={() => setPlacing({ kind: 'furniture', furnitureType: f.type })}
                className={`w-full text-left px-2 py-1.5 rounded text-xs ${placing?.furnitureType === f.type ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <button onClick={handleSave} disabled={saving} className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-xs font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Design'}
          </button>
        </div>
      </div>

      {/* Grid canvas */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-2 text-xs text-gray-500">
          Floor {currentFloor + 1}: {floor?.floorName} · {floor?.rooms?.length || 0} rooms · {floor?.furniture?.length || 0} furniture
          {placing && <span className="text-indigo-400 ml-3">Click to place {placing.kind}</span>}
        </div>
        <div
          className="relative border border-white/10 rounded-lg overflow-hidden"
          style={{ width: VISIBLE_W * GRID_SIZE, height: VISIBLE_H * GRID_SIZE, background: '#111118', cursor: placing ? 'crosshair' : 'default' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const gx = Math.floor((e.clientX - rect.left) / GRID_SIZE);
            const gy = Math.floor((e.clientY - rect.top) / GRID_SIZE);
            handleGridClick(gx, gy);
          }}
        >
          {/* Grid lines */}
          <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
            {Array.from({ length: VISIBLE_W }).map((_, i) => (
              <line key={`v${i}`} x1={i * GRID_SIZE} y1={0} x2={i * GRID_SIZE} y2={VISIBLE_H * GRID_SIZE} stroke="#ffffff08" strokeWidth="1" />
            ))}
            {Array.from({ length: VISIBLE_H }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * GRID_SIZE} x2={VISIBLE_W * GRID_SIZE} y2={i * GRID_SIZE} stroke="#ffffff08" strokeWidth="1" />
            ))}
          </svg>

          {/* Rooms */}
          {floor?.rooms?.map(room => (
            <div key={room.roomId} className="absolute border border-indigo-500/60 bg-indigo-500/10 rounded flex items-start justify-start overflow-hidden"
              style={{ left: room.position.x * GRID_SIZE, top: room.position.y * GRID_SIZE, width: room.size.width * GRID_SIZE, height: room.size.height * GRID_SIZE }}>
              <span className="text-indigo-300 text-xs px-1 pt-0.5 leading-tight">{room.name}</span>
            </div>
          ))}

          {/* Furniture */}
          {floor?.furniture?.map(item => {
            const emojis = { desk: '🖥', whiteboard: '📋', meeting_room: '🎙', tv_screen: '📺', reception_desk: '🛎' };
            return (
              <div key={item.furnitureId} className="absolute flex items-center justify-center"
                style={{ left: item.position.x * GRID_SIZE, top: item.position.y * GRID_SIZE, width: GRID_SIZE * 2, height: GRID_SIZE * 2, fontSize: GRID_SIZE }}>
                {emojis[item.type] || '📦'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
