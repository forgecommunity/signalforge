'use client';

import { createSignal, useSignalValue, batch } from 'signalforge/react';
import { useState, useEffect, useRef } from 'react';
import DemoLayout from '../../components/DemoLayout';

// ============================================================================
// Fine-Grained Reactive Spreadsheet
// Each cell is its own signal - only changed cells re-render!
// ============================================================================

type Cell = { id: string; value: string; editedBy?: string; editedAt?: number };

// Create a grid of cell signals (5x5)
const cellSignals = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 5 }, (_, col) => 
    createSignal<Cell>({ id: `${row}-${col}`, value: '' })
  )
);

// Track which cells have been edited (for highlighting)
const editHighlights = Array.from({ length: 5 }, () =>
  Array.from({ length: 5 }, () => createSignal(false))
);

// Simulated users
const users = [
  { id: 1, name: 'Alice', color: 'bg-blue-200 dark:bg-blue-800' },
  { id: 2, name: 'Bob', color: 'bg-green-200 dark:bg-green-800' },
  { id: 3, name: 'Charlie', color: 'bg-purple-200 dark:bg-purple-800' },
];

// Individual cell component - ONLY re-renders when ITS signal changes!
function ReactiveCell({ row, col }: { row: number; col: number }) {
  const cell = useSignalValue(cellSignals[row][col]);
  const highlight = useSignalValue(editHighlights[row][col]);
  const renderCountRef = useRef(0);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  renderCountRef.current += 1;

  const getUserColor = (userName?: string) => {
    const user = users.find(u => u.name === userName);
    return user ? user.color : 'bg-white dark:bg-gray-700';
  };

  return (
    <div className={`relative border border-gray-300 dark:border-gray-600 p-2 min-h-[80px] transition-all duration-300 ${
      highlight ? getUserColor(cell.editedBy) : 'bg-white dark:bg-gray-700'
    }`}>
      <div className="text-xs font-mono text-gray-400 absolute top-1 left-1">
        R:{mounted ? renderCountRef.current : 0}
      </div>
      <div className="mt-4 text-center font-semibold">
        {cell.value}
      </div>
      {cell.editedBy && (
        <div className="text-xs text-gray-500 dark:text-gray-400 absolute bottom-1 right-1">
          by {cell.editedBy}
        </div>
      )}
    </div>
  );
}

// Simulate collaborative editing
function simulateEdit(row: number, col: number, user: typeof users[0], value: string) {
  const cellSignal = cellSignals[row][col];
  const highlightSignal = editHighlights[row][col];
  
  // Update cell
  cellSignal.set({
    id: `${row}-${col}`,
    value,
    editedBy: user.name,
    editedAt: Date.now()
  });
  
  // Briefly highlight
  highlightSignal.set(true);
  setTimeout(() => highlightSignal.set(false), 800);
}

export default function CollaborationDemo() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [totalRenders, setTotalRenders] = useState(0);
  const [editCount, setEditCount] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (isSimulating) {
      interval = setInterval(() => {
        // Random cell, random user, random value
        const row = Math.floor(Math.random() * 5);
        const col = Math.floor(Math.random() * 5);
        const user = users[Math.floor(Math.random() * users.length)];
        const value = Math.floor(Math.random() * 100).toString();
        
        simulateEdit(row, col, user, value);
        setEditCount(c => c + 1);
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, [isSimulating]);

  const clearAll = () => {
    batch(() => {
      cellSignals.forEach(row => 
        row.forEach(cellSignal => 
          cellSignal.set({ id: cellSignal.get().id, value: '' })
        )
      );
    });
    setEditCount(0);
  };

  const fillRandom = () => {
    batch(() => {
      cellSignals.forEach((row, rowIdx) => 
        row.forEach((cellSignal, colIdx) => {
          const user = users[Math.floor(Math.random() * users.length)];
          simulateEdit(rowIdx, colIdx, user, Math.floor(Math.random() * 100).toString());
        })
      );
    });
  };

  return (
    <DemoLayout
      title="👥 Real-Time Collaboration - Only Update What Changes!"
      description="Like Google Sheets where multiple people edit at once - but SUPER fast! Watch how only the cells that change get updated."
    >
      <div className="space-y-8">
        {/* WHAT IS THIS? */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-2 border-blue-300 dark:border-blue-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">❓</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-blue-900 dark:text-blue-100">
                What Is This Demo Showing?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                Imagine a <strong>shared spreadsheet</strong> (like Google Sheets) where 3 people are editing at the same time.
                Each cell in the grid is <strong>independent</strong> - when Alice edits cell A1, only A1 updates. Bob and Charlie's cells stay frozen!
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>🔍 Look at the "R:" number</strong> in the top-left of each cell. That's how many times that cell re-rendered.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>👉 Try this:</strong> Click "▶️ Start Simulation" and watch - only the cells being edited increase their "R:" count!
            </p>
          </div>
        </div>

        {/* WHY USE THIS? */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-green-900 dark:text-green-100">
                Why Is This Important?
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                In real apps (like spreadsheets, collaborative docs, or dashboards), you might have <strong>hundreds or thousands</strong> of cells.
                If every cell re-renders when ONE changes, your app becomes <strong>laggy and slow</strong>! 😰
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
              <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">😰 Without SignalForge (Old Way)</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>✏️ User types in <strong>1 cell</strong></p>
                <p className="text-red-600 dark:text-red-400 font-bold">⚠️ ALL 25 cells re-render!</p>
                <p className="text-xs mt-2">It's like repainting your entire house just to fix one scratch! 🏠</p>
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-xs"><strong>With 100 cells:</strong> That's 100 updates for every keystroke! 💀</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">✅ With SignalForge (Smart Way)</h4>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>✏️ User types in <strong>1 cell</strong></p>
                <p className="text-green-600 dark:text-green-400 font-bold">🎯 Only THAT cell re-renders!</p>
                <p className="text-xs mt-2">Like fixing just the scratch - leave everything else alone! ✨</p>
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-xs"><strong>With 1000 cells:</strong> Still just 1 update! Blazing fast! 🚀</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOW DOES IT WORK? */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-2xl">🔧</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-purple-900 dark:text-purple-100">
                How Does It Work? (Super Simple!)
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Each cell = Its own signal</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`// Create 25 independent signals (5x5 grid)
const cellSignals = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 5 }, (_, col) => 
    createSignal({ value: '' }) // Each cell is separate!
  )
);`}</pre>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Think: 25 separate light switches, not 1 master switch! 💡</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Each cell watches ONLY its signal</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`function Cell({ row, col }) {
  const cell = useSignalValue(cellSignals[row][col]);
  // This cell ONLY updates when cellSignals[row][col] changes!
  return <div>{cell.value}</div>;
}`}</pre>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Each cell minds its own business! 🎯</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">Update = Only affected cell re-renders</h4>
              </div>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs overflow-x-auto">
{`// When user edits cell [2,3]:
cellSignals[2][3].set({ value: '42' });
// ✅ Only cell [2,3] re-renders
// ✅ Other 24 cells? Frozen, no re-render!`}</pre>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Surgical precision! Change only what's needed! ✂️</p>
            </div>
          </div>
        </div>

        {/* TRY IT YOURSELF! */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 border-2 border-orange-400 dark:border-orange-600 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-orange-900 dark:text-orange-100">🎮 Try It Yourself!</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold mb-2">
              📊 Total Edits So Far: <span className="text-2xl text-blue-600 dark:text-blue-400">{editCount}</span>
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              👀 <strong>Watch the "R:" number</strong> in the top-left corner of each cell below. 
              It shows how many times that cell re-rendered. Only edited cells will increase!
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors shadow-md ${
                isSimulating 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isSimulating ? '⏸️ Stop Auto-Edit' : '▶️ Auto-Edit (Watch the Magic!)'}
            </button>
            <button
              onClick={fillRandom}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md"
            >
              🎲 Fill All Cells
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold shadow-md"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Collaborative Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm font-semibold mb-2 text-center">👥 Simulated Users (Watch for their colors when editing!):</p>
          <div className="flex gap-6 justify-center">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${user.color} border-2 border-gray-400 dark:border-gray-500`} />
                <span className="font-semibold">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* The Spreadsheet Grid */}
        <div>
          <h3 className="text-xl font-bold mb-3 text-center">📊 Collaborative Spreadsheet (5×5 Grid)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
            Each cell is independent. Watch the "R:" counter to see which cells actually re-render!
          </p>
        <div className="bg-gray-100 dark:bg-gray-900 p-6 rounded-xl">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }, (_, row) =>
              Array.from({ length: 5 }, (_, col) => (
                <ReactiveCell key={`${row}-${col}`} row={row} col={col} />
              ))
            )}
          </div>
        </div>
        </div>

        {/* Technical Explanation */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4 text-blue-900 dark:text-blue-100">
            🔬 How It Works
          </h3>
          <div className="space-y-4 text-sm">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">1️⃣ Each Cell = Independent Signal</h4>
              <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 overflow-x-auto">
{`// 5x5 grid = 25 independent signals
const cellSignals = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 5 }, (_, col) => 
    createSignal({ id: \`\${row}-\${col}\`, value: '' })
  )
);

// Each cell component subscribes to ONE signal
function ReactiveCell({ row, col }) {
  const cell = useSignalValue(cellSignals[row][col]);
  // Only re-renders when THIS cell's signal changes!
  return <div>{cell.value}</div>;
}`}
              </pre>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2">2️⃣ Fine-Grained Updates</h4>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                When user edits cell [2,3]:
              </p>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                <li>• SignalForge updates <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">cellSignals[2][3]</code></li>
                <li>• Only <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">ReactiveCell(row=2, col=3)</code> re-renders</li>
                <li>• Other 24 cells remain untouched</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-bold mb-2 text-red-600 dark:text-red-400">
                ❌ Context API Equivalent
              </h4>
              <pre className="bg-gray-900 text-red-400 p-3 rounded mt-2 overflow-x-auto">
{`// All cells in ONE big state object
const [cells, setCells] = useState(/* 25 cells */);

function ReactiveCell({ row, col }) {
  // Subscribes to ENTIRE cells array
  const cells = useContext(CellsContext);
  const cell = cells[row][col];
  
  // Re-renders whenever ANY cell changes! 😱
  return <div>{cell.value}</div>;
}

// Edit one cell → ALL 25 cells re-render
setCells(prev => /* update cells[2][3] */);`}
              </pre>
            </div>
          </div>
        </div>

        {/* Real-World Use Cases */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-6">
          <h3 className="text-2xl font-bold mb-4 text-purple-900 dark:text-purple-100">
            🌍 Real-World Applications
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-bold mb-2">Live Dashboards</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                100+ metrics updating independently. Only changed widgets re-render.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl mb-2">💬</div>
              <h4 className="font-bold mb-2">Chat Applications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                1000+ messages. Only new messages render. Scroll stays smooth.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <div className="text-3xl mb-2">🎮</div>
              <h4 className="font-bold mb-2">Games & Simulations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Each game entity is a signal. 60 FPS even with 1000+ objects.
              </p>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold mb-4 text-green-900 dark:text-green-100">
            📈 Why This Matters
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <div className="text-4xl font-bold text-green-600">25x</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fewer re-renders in this demo</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">100x</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">With 100-cell grids</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">1000x</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">With 1000-cell grids</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">∞</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scale without slowdown</p>
            </div>
          </div>
        </div>
      </div>
    </DemoLayout>
  );
}
