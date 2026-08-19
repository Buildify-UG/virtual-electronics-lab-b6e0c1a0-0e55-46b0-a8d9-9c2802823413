// ============================================================================
// CIRCUIT TYPE DEFINITIONS
// ============================================================================

export type ComponentCategory = 
  | 'Power'
  | 'Passive'
  | 'Diodes'
  | 'Transistors'
  | 'ICs'
  | 'Digital'
  | 'Switches'
  | 'Sensors'
  | 'Microcontrollers'
  | 'Arduino'
  | 'ESP32'
  | 'Communication'
  | 'Displays'
  | 'Motors'
  | 'Actuators'
  | 'Instruments'
  | 'Connectors';

export interface Terminal {
  id: string;
  name: string;
  type: 'positive' | 'negative' | 'signal' | 'ground';
  x: number;
  y: number;
}

export interface LibraryComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  symbol: string;
  icon: string;
  terminals: Terminal[];
  specs?: {
    voltage?: string;
    current?: string;
    resistance?: string;
    capacitance?: string;
  };
  simulationModel?: 'battery' | 'switch' | 'led' | 'resistor' | 'capacitor' | 'diode' | 'transistor' | 'none';
}

export interface PlacedComponent {
  id: string;
  libraryId: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  value?: string;
  state?: boolean;
  terminals: Terminal[];
}

export interface Wire {
  id: string;
  fromComponentId: string;
  fromTerminalId: string;
  toComponentId: string;
  toTerminalId: string;
  color: string;
}

export interface CircuitProject {
  id: string;
  name: string;
  description?: string;
  components: PlacedComponent[];
  wires: Wire[];
  createdAt: number;
  updatedAt: number;
  simulationState?: {
    isRunning: boolean;
    switchStates: { [key: string]: boolean };
    ledStates: { [key: string]: boolean };
    errors: string[];
  };
}

export interface CircuitState {
  isValid: boolean;
  hasError: boolean;
  errorMessage?: string;
  isComplete: boolean;
  powerPath?: string;
}
