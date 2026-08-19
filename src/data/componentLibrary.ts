import { LibraryComponent, Terminal } from '@/types/circuit';

// ============================================================================
// COMPONENT LIBRARY - MOBILE FIRST
// ============================================================================

const createTerminals = (type: string): Terminal[] => {
  const terminals: { [key: string]: Terminal[] } = {
    battery: [
      { id: 'positive', name: 'Positive', type: 'positive', x: 45, y: 8 },
      { id: 'negative', name: 'Negative', type: 'negative', x: 45, y: 32 },
    ],
    switch: [
      { id: 'in', name: 'Input', type: 'signal', x: 8, y: 20 },
      { id: 'out', name: 'Output', type: 'signal', x: 32, y: 20 },
    ],
    led: [
      { id: 'positive', name: 'Anode', type: 'positive', x: 8, y: 20 },
      { id: 'negative', name: 'Cathode', type: 'negative', x: 32, y: 20 },
    ],
    resistor: [
      { id: 'left', name: 'Left', type: 'signal', x: 8, y: 20 },
      { id: 'right', name: 'Right', type: 'signal', x: 32, y: 20 },
    ],
    capacitor: [
      { id: 'left', name: 'Left', type: 'signal', x: 8, y: 20 },
      { id: 'right', name: 'Right', type: 'signal', x: 32, y: 20 },
    ],
  };
  return terminals[type] || [];
};

export const COMPONENT_LIBRARY: LibraryComponent[] = [
  // ===== POWER =====
  {
    id: 'battery-5v',
    name: 'Battery 5V',
    category: 'Power',
    description: 'DC power source 5V',
    symbol: '🔋',
    icon: '🔋',
    terminals: createTerminals('battery'),
    specs: { voltage: '5V' },
    simulationModel: 'battery',
  },
  {
    id: 'battery-9v',
    name: 'Battery 9V',
    category: 'Power',
    description: 'DC power source 9V',
    symbol: '🔋',
    icon: '🔋',
    terminals: createTerminals('battery'),
    specs: { voltage: '9V' },
    simulationModel: 'battery',
  },
  {
    id: 'battery-12v',
    name: 'Battery 12V',
    category: 'Power',
    description: 'DC power source 12V',
    symbol: '🔋',
    icon: '🔋',
    terminals: createTerminals('battery'),
    specs: { voltage: '12V' },
    simulationModel: 'battery',
  },

  // ===== PASSIVE =====
  {
    id: 'resistor-220',
    name: 'Resistor 220Ω',
    category: 'Passive',
    description: 'Current limiting resistor',
    symbol: '◻️',
    icon: '◻️',
    terminals: createTerminals('resistor'),
    specs: { resistance: '220Ω' },
    simulationModel: 'resistor',
  },
  {
    id: 'resistor-1k',
    name: 'Resistor 1kΩ',
    category: 'Passive',
    description: 'General purpose resistor',
    symbol: '◻️',
    icon: '◻️',
    terminals: createTerminals('resistor'),
    specs: { resistance: '1kΩ' },
    simulationModel: 'resistor',
  },
  {
    id: 'resistor-10k',
    name: 'Resistor 10kΩ',
    category: 'Passive',
    description: 'General purpose resistor',
    symbol: '◻️',
    icon: '◻️',
    terminals: createTerminals('resistor'),
    specs: { resistance: '10kΩ' },
    simulationModel: 'resistor',
  },
  {
    id: 'capacitor-100nf',
    name: 'Capacitor 100nF',
    category: 'Passive',
    description: 'Ceramic capacitor',
    symbol: '⚡',
    icon: '⚡',
    terminals: createTerminals('capacitor'),
    specs: { capacitance: '100nF' },
    simulationModel: 'capacitor',
  },

  // ===== DIODES =====
  {
    id: 'diode-1n4148',
    name: 'Diode 1N4148',
    category: 'Diodes',
    description: 'General purpose diode',
    symbol: '▶',
    icon: '▶',
    terminals: createTerminals('resistor'),
    simulationModel: 'diode',
  },

  // ===== OUTPUT =====
  {
    id: 'led-red',
    name: 'LED Red',
    category: 'Displays',
    description: 'Red light emitting diode',
    symbol: '🔴',
    icon: '🔴',
    terminals: createTerminals('led'),
    specs: { voltage: '2V', current: '20mA' },
    simulationModel: 'led',
  },
  {
    id: 'led-green',
    name: 'LED Green',
    category: 'Displays',
    description: 'Green light emitting diode',
    symbol: '🟢',
    icon: '🟢',
    terminals: createTerminals('led'),
    specs: { voltage: '2V', current: '20mA' },
    simulationModel: 'led',
  },
  {
    id: 'led-blue',
    name: 'LED Blue',
    category: 'Displays',
    description: 'Blue light emitting diode',
    symbol: '🔵',
    icon: '🔵',
    terminals: createTerminals('led'),
    specs: { voltage: '3V', current: '20mA' },
    simulationModel: 'led',
  },

  // ===== SWITCHES =====
  {
    id: 'switch-push',
    name: 'Push Button',
    category: 'Switches',
    description: 'Momentary push button switch',
    symbol: '⊙',
    icon: '⊙',
    terminals: createTerminals('switch'),
    simulationModel: 'switch',
  },

  // ===== MICROCONTROLLERS =====
  {
    id: 'arduino-uno',
    name: 'Arduino Uno',
    category: 'Arduino',
    description: 'ATmega328P microcontroller board',
    symbol: '💻',
    icon: '💻',
    terminals: [
      { id: 'gnd1', name: 'GND', type: 'ground', x: 8, y: 8 },
      { id: 'gnd2', name: 'GND', type: 'ground', x: 8, y: 32 },
      { id: 'd0', name: 'D0/RX', type: 'signal', x: 32, y: 8 },
      { id: 'd1', name: 'D1/TX', type: 'signal', x: 32, y: 16 },
      { id: 'd2', name: 'D2', type: 'signal', x: 32, y: 24 },
      { id: 'd3', name: 'D3', type: 'signal', x: 32, y: 32 },
      { id: '5v', name: '5V', type: 'positive', x: 20, y: 40 },
    ],
    simulationModel: 'none',
  },
  {
    id: 'esp32',
    name: 'ESP32',
    category: 'ESP32',
    description: 'WiFi/Bluetooth microcontroller',
    symbol: '📡',
    icon: '📡',
    terminals: [
      { id: 'gnd', name: 'GND', type: 'ground', x: 8, y: 20 },
      { id: 'vcc', name: 'VCC', type: 'positive', x: 32, y: 20 },
      { id: 'gpio0', name: 'GPIO0', type: 'signal', x: 20, y: 8 },
      { id: 'gpio1', name: 'GPIO1', type: 'signal', x: 20, y: 32 },
    ],
    simulationModel: 'none',
  },

  // ===== INSTRUMENTS =====
  {
    id: 'multimeter',
    name: 'Digital Multimeter',
    category: 'Instruments',
    description: 'Voltage, current, resistance meter',
    symbol: '📊',
    icon: '📊',
    terminals: [
      { id: 'red', name: 'Red Probe', type: 'signal', x: 8, y: 8 },
      { id: 'black', name: 'Black Probe', type: 'ground', x: 8, y: 32 },
    ],
    simulationModel: 'none',
  },
  {
    id: 'oscilloscope',
    name: 'Oscilloscope',
    category: 'Instruments',
    description: 'Waveform analyzer',
    symbol: '📈',
    icon: '📈',
    terminals: [
      { id: 'ch1', name: 'Channel 1', type: 'signal', x: 8, y: 8 },
      { id: 'gnd', name: 'Ground', type: 'ground', x: 8, y: 32 },
    ],
    simulationModel: 'none',
  },

  // ===== CONNECTORS =====
  {
    id: 'breadboard',
    name: 'Breadboard',
    category: 'Connectors',
    description: 'Solderless breadboard 830 holes',
    symbol: '📋',
    icon: '📋',
    terminals: [],
    simulationModel: 'none',
  },
];

export const getComponentsByCategory = (category: string): LibraryComponent[] => {
  return COMPONENT_LIBRARY.filter(c => c.category === category);
};

export const searchComponents = (query: string): LibraryComponent[] => {
  const q = query.toLowerCase();
  return COMPONENT_LIBRARY.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q)
  );
};

export const getCategories = (): string[] => {
  const cats = new Set(COMPONENT_LIBRARY.map(c => c.category));
  return Array.from(cats).sort();
};
