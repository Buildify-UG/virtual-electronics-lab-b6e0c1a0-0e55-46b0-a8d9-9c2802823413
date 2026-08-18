import React, { useState, useRef } from 'react';
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
  LogOut,
  User,
  FileUp,
  Save,
  Folder,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Component {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  rotation: number;
  value?: string;
  state?: boolean;
}

interface Wire {
  id: string;
  fromComponentId: string;
  fromPin: string;
  toComponentId: string;
  toPin: string;
  color: string;
}

// ============================================================================
// COMPONENT LIBRARY (HARDCODED)
// ============================================================================

const COMPONENT_LIBRARY = [
  {
    id: 'battery',
    name: 'Battery (5V)',
    category: 'Power',
    description: 'DC Power Source',
    voltage: '5V',
    image: '🔋',
  },
  {
    id: 'battery-9v',
    name: 'Battery (9V)',
    category: 'Power',
    description: 'DC Power Source',
    voltage: '9V',
    image: '🔋',
  },
  {
    id: 'switch',
    name: 'Push Button Switch',
    category: 'Switching',
    description: 'Momentary switch',
    image: '⚙️',
  },
  {
    id: 'led-red',
    name: 'LED (Red)',
    category: 'Output',
    description: 'Light Emitting Diode',
    voltage: '2V',
    current: '20mA',
    image: '🔴',
  },
  {
    id: 'led-green',
    name: 'LED (Green)',
    category: 'Output',
    description: 'Light Emitting Diode',
    voltage: '2V',
    current: '20mA',
    image: '🟢',
  },
  {
    id: 'led-blue',
    name: 'LED (Blue)',
    category: 'Output',
    description: 'Light Emitting Diode',
    voltage: '3V',
    current: '20mA',
    image: '🔵',
  },
  {
    id: 'resistor-220',
    name: 'Resistor (220Ω)',
    category: 'Passive',
    description: 'Current limiting resistor',
    resistance: '220Ω',
    image: '◻️',
  },
  {
    id: 'resistor-1k',
    name: 'Resistor (1kΩ)',
    category: 'Passive',
    description: 'General purpose resistor',
    resistance: '1kΩ',
    image: '◻️',
  },
  {
    id: 'resistor-10k',
    name: 'Resistor (10kΩ)',
    category: 'Passive',
    description: 'General purpose resistor',
    resistance: '10kΩ',
    image: '◻️',
  },
  {
    id: 'capacitor-100nf',
    name: 'Capacitor (100nF)',
    category: 'Passive',
    description: 'Ceramic capacitor',
    capacitance: '100nF',
    image: '⚡',
  },
  {
    id: 'breadboard',
    name: 'Breadboard (830 holes)',
    category: 'Prototyping',
    description: 'Solderless breadboard',
    image: '📋',
  },
  {
    id: 'arduino-uno',
    name: 'Arduino Uno',
    category: 'Programmable',
    description: 'Microcontroller board',
    image: '💻',
  },
  {
    id: 'esp32',
    name: 'ESP32',
    category: 'Programmable',
    description: 'WiFi/Bluetooth microcontroller',
    image: '📡',
  },
  {
    id: 'multimeter',
    name: 'Digital Multimeter',
    category: 'Instruments',
    description: 'Voltage, current, resistance',
    image: '📊',
  },
  {
    id: 'oscilloscope',
    name: 'Oscilloscope',
    category: 'Instruments',
    description: 'Waveform analyzer',
    image: '📈',
  },
  {
    id: 'power-supply',
    name: 'DC Power Supply',
    category: 'Instruments',
    description: 'Adjustable DC source',
    image: '⚡',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Index: React.FC = () => {
  // ========== STATE ==========
  const [components, setComponents] = useState<Component[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'components' | 'instruments' | 'info'>('components');
  const [switchState, setSwitchState] = useState(false);
  const [ledStates, setLedStates] = useState<{ [key: string]: boolean }>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  // ========== SIMULATION LOGIC ==========
  // Simple battery-switch-resistor-LED simulation
  const simulateCircuit = () => {
    if (!isRunning) return;

    // Find battery, switch, LED in circuit
    const hasBattery = components.some((c) => c.id.startsWith('battery'));
    const hasSwitch = components.some((c) => c.id === 'switch');
    const hasLED = components.some((c) => c.id.startsWith('led-'));

    if (hasBattery && hasSwitch && hasLED && switchState) {
      // Turn on all LEDs when switch is ON and battery exists
      const newLedStates: { [key: string]: boolean } = {};
      components.forEach((c) => {
        if (c.id.startsWith('led-')) {
          newLedStates[c.id] = true;
        }
      });
      setLedStates(newLedStates);
    } else {
      setLedStates({});
    }
  };

  React.useEffect(() => {
    simulateCircuit();
  }, [isRunning, switchState, components, ledStates]);

  // ========== HANDLERS ==========
  const filteredComponents = COMPONENT_LIBRARY.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addComponent = (libComponent: typeof COMPONENT_LIBRARY[0]) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const maxX = canvasRect ? Math.max(200, canvasRect.width - 100) : 500;
    const maxY = canvasRect ? Math.max(200, canvasRect.height - 100) : 400;
    
    const newComponent: Component = {
      id: `${libComponent.id}-${Date.now()}`,
      name: libComponent.name,
      category: libComponent.category,
      x: Math.random() * (maxX - 100) + 50,
      y: Math.random() * (maxY - 100) + 50,
      rotation: 0,
      state: false,
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter((c) => c.id !== id));
    setWires(wires.filter((w) => w.fromComponentId !== id && w.toComponentId !== id));
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const toggleSwitch = () => {
    setSwitchState(!switchState);
  };

  const clearCircuit = () => {
    setComponents([]);
    setWires([]);
    setLedStates({});
    setIsRunning(false);
  };

  // ========== RENDER HELPERS ==========
  const getComponentIcon = (name: string) => {
    if (name.includes('Battery')) return '🔋';
    if (name.includes('Switch')) return '⚙️';
    if (name.includes('LED')) return '💡';
    if (name.includes('Resistor')) return '◻️';
    if (name.includes('Capacitor')) return '⚡';
    if (name.includes('Breadboard')) return '📋';
    if (name.includes('Arduino') || name.includes('ESP32')) return '💻';
    if (name.includes('Multimeter')) return '📊';
    if (name.includes('Oscilloscope')) return '📈';
    if (name.includes('Power Supply')) return '⚡';
    return '🔧';
  };

  const getComponentColor = (component: Component) => {
    if (component.name.includes('Battery')) return 'bg-yellow-600';
    if (component.name.includes('Switch')) return 'bg-gray-600';
    if (component.name.includes('LED')) {
      if (ledStates[component.id]) {
        if (component.name.includes('Red')) return 'bg-red-500 shadow-lg shadow-red-500';
        if (component.name.includes('Green')) return 'bg-green-500 shadow-lg shadow-green-500';
        if (component.name.includes('Blue')) return 'bg-blue-500 shadow-lg shadow-blue-500';
      }
      return 'bg-gray-700';
    }
    if (component.name.includes('Resistor')) return 'bg-orange-600';
    if (component.name.includes('Capacitor')) return 'bg-purple-600';
    if (component.name.includes('Breadboard')) return 'bg-amber-900';
    if (component.name.includes('Arduino') || component.name.includes('ESP32')) return 'bg-blue-700';
    return 'bg-gray-600';
  };

  // ========== RENDER ==========
  return (
    <div className="flex h-screen bg-background text-foreground flex-col md:flex-row">
      {/* ====== SIDEBAR ====== */}
      <div
        className={`${
          sidebarOpen ? 'w-full md:w-80 h-auto md:h-screen' : 'w-0 h-0'
        } bg-sidebar border-r border-b md:border-b-0 border-sidebar-border transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-400" />
            ElectroLab
          </h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Virtual Electronics Lab</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-sidebar-border">
          {(['components', 'instruments', 'info'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-sidebar-accent text-sidebar-foreground'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'components' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-sidebar-foreground/50" />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-sidebar-background border border-sidebar-border rounded text-sm text-sidebar-foreground placeholder-sidebar-foreground/50"
                />
              </div>

              <div className="space-y-2">
                {filteredComponents.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => addComponent(comp)}
                    className="w-full text-left p-2 rounded bg-sidebar-background hover:bg-sidebar-accent border border-sidebar-border transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getComponentIcon(comp.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{comp.name}</p>
                        <p className="text-xs text-sidebar-foreground/50">{comp.category}</p>
                      </div>
                      <Plus className="w-4 h-4 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'instruments' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-sidebar-background border border-sidebar-border">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Digital Multimeter
                </h3>
                <div className="text-xs space-y-1">
                  <p>Voltage: <span className="text-blue-400">0.00V</span></p>
                  <p>Current: <span className="text-blue-400">0.00A</span></p>
                  <p>Resistance: <span className="text-blue-400">∞Ω</span></p>
                </div>
              </div>

              <div className="p-3 rounded bg-sidebar-background border border-sidebar-border">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Waves className="w-4 h-4" />
                  Oscilloscope
                </h3>
                <div className="text-xs">
                  <p className="text-sidebar-foreground/70">No signal detected</p>
                </div>
              </div>

              <div className="p-3 rounded bg-sidebar-background border border-sidebar-border">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Power className="w-4 h-4" />
                  DC Power Supply
                </h3>
                <div className="text-xs space-y-1">
                  <p>Output: <span className="text-blue-400">5.0V</span></p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-3">
              <div className="p-3 rounded bg-sidebar-background border border-sidebar-border">
                <h3 className="text-sm font-semibold mb-2">Circuit Status</h3>
                <div className="text-xs space-y-1">
                  <p>Components: <span className="text-blue-400">{components.length}</span></p>
                  <p>Wires: <span className="text-blue-400">{wires.length}</span></p>
                  <p>Simulation: <span className={isRunning ? 'text-green-400' : 'text-gray-400'}>{isRunning ? 'Running' : 'Stopped'}</span></p>
                </div>
              </div>

              {selectedComponent && (
                <div className="p-3 rounded bg-sidebar-background border border-sidebar-border">
                  <h3 className="text-sm font-semibold mb-2">{selectedComponent.name}</h3>
                  <div className="text-xs space-y-1">
                    <p>ID: {selectedComponent.id.slice(0, 8)}...</p>
                    <p>Category: {selectedComponent.category}</p>
                    <p>Position: ({Math.round(selectedComponent.x)}, {Math.round(selectedComponent.y)})</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Save Project
          </button>
          <button className="w-full px-3 py-2 bg-gray-700 text-sidebar-foreground rounded text-sm font-medium hover:bg-gray-600 flex items-center justify-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* ====== MAIN CONTENT ====== */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* TOP BAR */}
        <div className="h-14 md:h-16 bg-card border-b border-border flex items-center justify-between px-3 md:px-6 gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-secondary rounded transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-lg font-semibold">Virtual Electronics Laboratory</h2>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-secondary rounded transition-colors" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-secondary rounded transition-colors" title="Profile">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-2 md:gap-4 p-2 md:p-4">
          {/* CANVAS */}
          <div className="flex-1 bg-gray-900 rounded-lg border border-border overflow-hidden relative shadow-lg min-h-64 md:min-h-0">
            <div
              ref={canvasRef}
              className="w-full h-full relative bg-gradient-to-br from-gray-900 via-gray-800 to-black"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, hsl(var(--lab-grid)) 1px, transparent 1px),
                  linear-gradient(0deg, hsl(var(--lab-grid)) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            >
              {/* COMPONENTS */}
              {components.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => setSelectedComponent(comp)}
                  className={`absolute w-16 h-16 rounded-lg flex items-center justify-center cursor-move transition-all ${getComponentColor(
                    comp
                  )} ${selectedComponent?.id === comp.id ? 'ring-2 ring-blue-400' : ''} shadow-md hover:shadow-lg`}
                  style={{
                    left: `${comp.x}px`,
                    top: `${comp.y}px`,
                    transform: `rotate(${comp.rotation}deg)`,
                  }}
                  draggable
                  onDragEnd={(e) => {
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (rect) {
                      const newX = Math.max(0, Math.min(e.clientX - rect.left - 32, rect.width - 64));
                      const newY = Math.max(0, Math.min(e.clientY - rect.top - 32, rect.height - 64));
                      updateComponent(comp.id, {
                        x: newX,
                        y: newY,
                      });
                    }
                  }}
                >
                  <span className="text-3xl">{getComponentIcon(comp.name)}</span>

                  {/* COMPONENT LABEL */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 px-2 py-1 rounded text-xs whitespace-nowrap border border-border">
                    {comp.name.split('(')[0].trim()}
                  </div>

                  {/* COMPONENT ACTIONS */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComponent(comp.id);
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 hover:bg-red-700 shadow-md opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* SWITCH TOGGLE */}
                  {comp.name.includes('Switch') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSwitch();
                      }}
                      className={`absolute -bottom-2 -right-2 rounded-full p-1 shadow-md ${
                        switchState ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {/* EMPTY STATE */}
              {components.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Lightbulb className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-lg font-medium">Add components to start</p>
                    <p className="text-gray-500 text-sm">Search and select from the left panel</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTROL PANEL */}
          <div className="w-72 bg-card border border-border rounded-lg p-4 flex flex-col gap-4 shadow-lg">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Simulation Control
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                  isRunning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Stop Simulation
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Simulation
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  simulateCircuit();
                }}
                className="w-full px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

              <button
                onClick={clearCircuit}
                className="w-full px-4 py-2 rounded-lg border border-red-600 text-red-400 hover:bg-red-600/10 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-3">Circuit Information</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Components:</span>
                  <span className="font-medium">{components.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connections:</span>
                  <span className="font-medium">{wires.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${isRunning ? 'text-green-400' : 'text-gray-400'}`}>
                    {isRunning ? 'Running' : 'Idle'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Switch:</span>
                  <span className={`font-medium ${switchState ? 'text-green-400' : 'text-gray-400'}`}>
                    {switchState ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold mb-3">Quick Help</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• Drag components to move</p>
                <p>• Click to select component</p>
                <p>• Click trash to remove</p>
                <p>• Toggle switch to test circuit</p>
                <p>• Start simulation to see behavior</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <FileUp className="w-4 h-4" />
                Submit Component
              </button>
              <button className="w-full px-3 py-2 bg-gray-700 text-foreground rounded text-sm font-medium hover:bg-gray-600 flex items-center justify-center gap-2">
                <Folder className="w-4 h-4" />
                My Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
