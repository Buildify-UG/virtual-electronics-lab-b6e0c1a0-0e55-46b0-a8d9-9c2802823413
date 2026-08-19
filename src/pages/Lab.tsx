import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Settings,
  Menu,
  X,
  ChevronDown,
  Gauge,
  Lightbulb,
  Waves,
  Power,
  Cpu,
  Save,
  Folder,
  AlertCircle,
  Check,
  Wifi,
  MoreVertical,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { COMPONENT_LIBRARY, getCategories, searchComponents } from '@/data/componentLibrary';
import { PlacedComponent, Wire, LibraryComponent } from '@/types/circuit';
import { simulateSimpleCircuit, validateCircuit } from '@/lib/simulationEngine';

// ============================================================================
// MOBILE-FIRST ELECTROLAB - NEW ARCHITECTURE
// ============================================================================

const Lab: React.FC = () => {
  // ========== STATE ==========
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<PlacedComponent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showComponentDrawer, setShowComponentDrawer] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>({});
  const [ledStates, setLedStates] = useState<{ [key: string]: boolean }>({});
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [wirePath, setWirePath] = useState<{ fromId: string; fromTerminal: string } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ========== SIMULATION ==========
  useEffect(() => {
    if (!isRunning) return;

    const result = simulateSimpleCircuit({
      components,
      wires,
      switchStates,
    });

    setLedStates(result.ledStates);
  }, [isRunning, components, wires, switchStates]);

  // ========== HANDLERS ==========
  const categories = getCategories();
  const filteredComponents = searchQuery
    ? searchComponents(searchQuery)
    : activeCategory
    ? COMPONENT_LIBRARY.filter(c => c.category === activeCategory)
    : COMPONENT_LIBRARY;

  const addComponent = (libComponent: LibraryComponent) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const centerX = canvasRect ? canvasRect.width / 2 : 200;
    const centerY = canvasRect ? canvasRect.height / 2 : 150;

    const newComponent: PlacedComponent = {
      id: `${libComponent.id}-${Date.now()}`,
      libraryId: libComponent.id,
      name: libComponent.name,
      x: centerX - 30,
      y: centerY - 30,
      rotation: 0,
      terminals: libComponent.terminals,
    };

    setComponents([...components, newComponent]);
    setShowComponentDrawer(false);
    setSearchQuery('');
    setActiveCategory(null);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
    setWires(wires.filter(w => w.fromComponentId !== id && w.toComponentId !== id));
    if (selectedComponent?.id === id) setSelectedComponent(null);
  };

  const updateComponent = (id: string, updates: Partial<PlacedComponent>) => {
    setComponents(components.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const toggleSwitch = (componentId: string) => {
    setSwitchStates(prev => ({
      ...prev,
      [componentId]: !prev[componentId],
    }));
  };

  const clearCircuit = () => {
    setComponents([]);
    setWires([]);
    setLedStates({});
    setSwitchStates({});
    setIsRunning(false);
    setSelectedComponent(null);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-component]')) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCanvas) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  // ========== RENDER HELPERS ==========
  const getComponentColor = (component: PlacedComponent) => {
    if (component.libraryId.startsWith('battery-')) return 'bg-yellow-600';
    if (component.libraryId.startsWith('switch-')) return 'bg-gray-600';
    if (component.libraryId.startsWith('led-')) {
      if (ledStates[component.id]) {
        if (component.libraryId.includes('red')) return 'bg-red-500 shadow-lg shadow-red-500';
        if (component.libraryId.includes('green')) return 'bg-green-500 shadow-lg shadow-green-500';
        if (component.libraryId.includes('blue')) return 'bg-blue-500 shadow-lg shadow-blue-500';
      }
      return 'bg-gray-700';
    }
    if (component.libraryId.startsWith('resistor-')) return 'bg-orange-600';
    if (component.libraryId.startsWith('capacitor-')) return 'bg-purple-600';
    if (component.libraryId.startsWith('arduino-')) return 'bg-blue-700';
    if (component.libraryId.startsWith('esp32')) return 'bg-blue-600';
    return 'bg-gray-600';
  };

  const validation = validateCircuit(components, wires);

  // ========== RENDER ==========
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* TOP BAR */}
      <div className="h-14 bg-card border-b border-border flex items-center justify-between px-3 gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Zap className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <h1 className="text-sm font-bold truncate">ElectroLab</h1>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            className="p-2 hover:bg-secondary rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded transition-colors" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN CANVAS - FULL SCREEN */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-gradient-to-br from-gray-900 via-gray-800 to-black"
        style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--lab-grid)) 1px, transparent 1px),
            linear-gradient(0deg, hsl(var(--lab-grid)) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        <div
          ref={canvasRef}
          className="w-full h-full relative"
          style={{
            transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDraggingCanvas ? 'none' : 'transform 0.2s',
          }}
        >
          {/* COMPONENTS */}
          {components.map(comp => (
            <div
              key={comp.id}
              data-component="true"
              onClick={() => setSelectedComponent(comp)}
              className={`absolute w-16 h-16 rounded-lg flex items-center justify-center cursor-pointer transition-all ${getComponentColor(
                comp
              )} ${selectedComponent?.id === comp.id ? 'ring-2 ring-blue-400' : ''} shadow-md hover:shadow-lg`}
              style={{
                left: `${comp.x}px`,
                top: `${comp.y}px`,
                transform: `rotate(${comp.rotation}deg)`,
              }}
              draggable
              onDragEnd={e => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect) {
                  updateComponent(comp.id, {
                    x: (e.clientX - rect.left) / zoom - 32,
                    y: (e.clientY - rect.top) / zoom - 32,
                  });
                }
              }}
            >
              <span className="text-3xl">{COMPONENT_LIBRARY.find(c => c.id === comp.libraryId)?.symbol}</span>

              {/* LABEL */}
              <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap border border-border pointer-events-none z-10">
                {comp.name.split(' ')[0]}
              </div>

              {/* DELETE BUTTON */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  removeComponent(comp.id);
                }}
                className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 hover:bg-red-700 shadow-md opacity-0 hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>

              {/* SWITCH TOGGLE */}
              {comp.libraryId.startsWith('switch-') && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleSwitch(comp.id);
                  }}
                  className={`absolute -bottom-2 -right-2 rounded-full p-1 shadow-md transition-all ${
                    switchStates[comp.id] ? 'bg-green-500 hover:bg-green-600 scale-110' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                  title={switchStates[comp.id] ? 'Switch: ON' : 'Switch: OFF'}
                >
                  <Power className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* EMPTY STATE */}
          {components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <Lightbulb className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg font-medium">Add components</p>
                <p className="text-gray-500 text-sm">Tap + button below</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM TOOLBAR - MOBILE FIRST */}
      <div className="h-auto bg-card border-t border-border p-2 flex-shrink-0">
        <div className="flex gap-2 justify-between items-center flex-wrap">
          {/* ADD COMPONENT */}
          <button
            onClick={() => setShowComponentDrawer(!showComponentDrawer)}
            className="flex-1 min-w-[80px] px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>

          {/* SIMULATION CONTROLS */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 min-w-[80px] px-3 py-2 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Stop' : 'Run'}
          </button>

          {/* RESET */}
          <button
            onClick={() => {
              setIsRunning(false);
              setSwitchStates({});
              setLedStates({});
            }}
            className="flex-1 min-w-[80px] px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          {/* CLEAR */}
          <button
            onClick={clearCircuit}
            className="flex-1 min-w-[80px] px-3 py-2 bg-red-900 hover:bg-red-800 text-red-200 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>

          {/* SAVE */}
          <button className="flex-1 min-w-[80px] px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors">
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>

        {/* STATUS BAR */}
        <div className="mt-2 p-2 bg-gray-900 rounded border border-border text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Components:</span>
            <span className="text-blue-400 font-medium">{components.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Wires:</span>
            <span className="text-blue-400 font-medium">{wires.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className={`font-medium ${isRunning ? 'text-green-400' : 'text-gray-500'}`}>
              {isRunning ? 'Running' : 'Idle'}
            </span>
          </div>
          {validation.hasError && (
            <div className="flex items-center gap-1 text-yellow-400">
              <AlertCircle className="w-3 h-3" />
              <span>{validation.errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* COMPONENT DRAWER - BOTTOM SHEET */}
      {showComponentDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* OVERLAY */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setShowComponentDrawer(false)}
          />

          {/* DRAWER */}
          <div className="bg-card border-t border-border rounded-t-lg max-h-[80vh] flex flex-col">
            {/* HEADER */}
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h2 className="text-sm font-semibold">Add Component</h2>
              <button
                onClick={() => setShowComponentDrawer(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEARCH */}
            <div className="p-3 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-foreground/50" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded text-sm text-foreground placeholder-foreground/50"
                />
              </div>
            </div>

            {/* CATEGORIES */}
            {!searchQuery && (
              <div className="p-3 border-b border-border flex gap-2 overflow-x-auto flex-shrink-0">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* COMPONENTS LIST */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredComponents.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-sm">No components found</p>
                </div>
              ) : (
                filteredComponents.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => addComponent(comp)}
                    className="w-full text-left p-3 bg-secondary hover:bg-secondary/80 rounded border border-border transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{comp.symbol}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{comp.name}</p>
                        <p className="text-xs text-foreground/60 truncate">{comp.description}</p>
                      </div>
                      <Plus className="w-4 h-4 flex-shrink-0 text-blue-400" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lab;
