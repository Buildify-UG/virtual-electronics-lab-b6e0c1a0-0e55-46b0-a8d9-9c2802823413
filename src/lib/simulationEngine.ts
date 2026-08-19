import { PlacedComponent, Wire, CircuitState } from '@/types/circuit';

// ============================================================================
// CIRCUIT SIMULATION ENGINE
// ============================================================================

export interface SimulationContext {
  components: PlacedComponent[];
  wires: Wire[];
  switchStates: { [key: string]: boolean };
}

export interface SimulationResult {
  isValid: boolean;
  hasError: boolean;
  errorMessage?: string;
  ledStates: { [key: string]: boolean };
  powerPaths: string[];
}

/**
 * Find all components connected to a given component terminal
 */
const findConnectedTerminals = (
  componentId: string,
  terminalId: string,
  wires: Wire[]
): Array<{ componentId: string; terminalId: string }> => {
  const connected: Array<{ componentId: string; terminalId: string }> = [];

  wires.forEach(wire => {
    if (wire.fromComponentId === componentId && wire.fromTerminalId === terminalId) {
      connected.push({ componentId: wire.toComponentId, terminalId: wire.toTerminalId });
    }
    if (wire.toComponentId === componentId && wire.toTerminalId === terminalId) {
      connected.push({ componentId: wire.fromComponentId, terminalId: wire.fromTerminalId });
    }
  });

  return connected;
};

/**
 * Trace a power path from battery through circuit
 */
const tracePowerPath = (
  startComponentId: string,
  currentTerminalId: string,
  components: PlacedComponent[],
  wires: Wire[],
  switchStates: { [key: string]: boolean },
  visited: Set<string> = new Set()
): boolean => {
  const visitKey = `${startComponentId}-${currentTerminalId}`;
  if (visited.has(visitKey)) return false;
  visited.add(visitKey);

  const currentComponent = components.find(c => c.id === startComponentId);
  if (!currentComponent) return false;

  // If we reach a negative terminal or ground, power path is complete
  const currentTerminal = currentComponent.terminals.find(t => t.id === currentTerminalId);
  if (currentTerminal?.type === 'negative' || currentTerminal?.type === 'ground') {
    return true;
  }

  const connected = findConnectedTerminals(startComponentId, currentTerminalId, wires);

  for (const { componentId, terminalId } of connected) {
    const nextComponent = components.find(c => c.id === componentId);
    if (!nextComponent) continue;

    // Check if switch blocks the path
    if (nextComponent.libraryId.startsWith('switch-')) {
      if (!switchStates[componentId]) continue; // Switch is OFF, block path
    }

    // Recursively trace from the connected component's opposite terminal
    const nextTerminal = nextComponent.terminals.find(t => t.id === terminalId);
    if (!nextTerminal) continue;

    // Find the opposite terminal
    const oppositeTerminal = nextComponent.terminals.find(
      t => t.id !== terminalId && (t.type === 'positive' || t.type === 'negative' || t.type === 'signal')
    );

    if (oppositeTerminal && tracePowerPath(componentId, oppositeTerminal.id, components, wires, switchStates, visited)) {
      return true;
    }
  }

  return false;
};

/**
 * Main simulation function
 */
export const simulateCircuit = (context: SimulationContext): SimulationResult => {
  const { components, wires, switchStates } = context;
  const ledStates: { [key: string]: boolean } = {};
  const powerPaths: string[] = [];
  const errors: string[] = [];

  // Check for battery
  const batteries = components.filter(c => c.libraryId.startsWith('battery-'));
  if (batteries.length === 0) {
    return {
      isValid: false,
      hasError: true,
      errorMessage: 'No power source (battery) in circuit',
      ledStates,
      powerPaths,
    };
  }

  // Initialize all LEDs as OFF
  components.forEach(c => {
    if (c.libraryId.startsWith('led-')) {
      ledStates[c.id] = false;
    }
  });

  // For each LED, check if there's a valid power path
  components.forEach(ledComponent => {
    if (!ledComponent.libraryId.startsWith('led-')) return;

    // Try to trace power from positive terminal through circuit
    const positiveTerminal = ledComponent.terminals.find(t => t.type === 'positive');
    if (!positiveTerminal) return;

    // Find if there's a path from any battery positive to this LED's positive
    for (const battery of batteries) {
      const batteryPositive = battery.terminals.find(t => t.type === 'positive');
      if (!batteryPositive) continue;

      // Check if battery positive connects to LED through valid path
      const connected = findConnectedTerminals(battery.id, batteryPositive.id, wires);

      for (const { componentId, terminalId } of connected) {
        if (tracePowerPath(componentId, terminalId, components, wires, switchStates)) {
          // Check if this path leads to the LED
          const pathLeadsToLED = tracePowerPath(
            ledComponent.id,
            positiveTerminal.id,
            components,
            wires,
            switchStates
          );

          if (pathLeadsToLED) {
            ledStates[ledComponent.id] = true;
            powerPaths.push(`Battery → ... → ${ledComponent.name}`);
            break;
          }
        }
      }
    }
  });

  return {
    isValid: true,
    hasError: false,
    ledStates,
    powerPaths,
  };
};

/**
 * Simplified simulation for basic battery-switch-LED circuit
 * Used when full path tracing is not needed
 */
export const simulateSimpleCircuit = (context: SimulationContext): SimulationResult => {
  const { components, wires, switchStates } = context;
  const ledStates: { [key: string]: boolean } = {};

  // Check for required components
  const hasBattery = components.some(c => c.libraryId.startsWith('battery-'));
  const hasSwitch = components.some(c => c.libraryId.startsWith('switch-'));
  const hasLED = components.some(c => c.libraryId.startsWith('led-'));

  if (!hasBattery) {
    return {
      isValid: false,
      hasError: true,
      errorMessage: 'No battery in circuit',
      ledStates,
      powerPaths: [],
    };
  }

  // Initialize all LEDs
  components.forEach(c => {
    if (c.libraryId.startsWith('led-')) {
      ledStates[c.id] = false;
    }
  });

  // If switch exists and is ON, or if no switch exists, turn on LEDs
  const switchIsOn = !hasSwitch || Object.values(switchStates).some(state => state === true);

  if (switchIsOn && hasLED) {
    components.forEach(c => {
      if (c.libraryId.startsWith('led-')) {
        ledStates[c.id] = true;
      }
    });
  }

  return {
    isValid: true,
    hasError: false,
    ledStates,
    powerPaths: switchIsOn ? ['Battery → Switch → LED'] : [],
  };
};

/**
 * Validate circuit connections
 */
export const validateCircuit = (components: PlacedComponent[], wires: Wire[]): CircuitState => {
  const hasBattery = components.some(c => c.libraryId.startsWith('battery-'));
  const hasLED = components.some(c => c.libraryId.startsWith('led-'));

  if (!hasBattery && components.length > 0) {
    return {
      isValid: false,
      hasError: true,
      errorMessage: 'Missing power source (battery)',
      isComplete: false,
    };
  }

  if (!hasLED && components.length > 0) {
    return {
      isValid: false,
      hasError: true,
      errorMessage: 'No output device (LED) in circuit',
      isComplete: false,
    };
  }

  if (wires.length === 0 && components.length > 1) {
    return {
      isValid: false,
      hasError: true,
      errorMessage: 'Components not connected',
      isComplete: false,
    };
  }

  return {
    isValid: true,
    hasError: false,
    isComplete: hasBattery && hasLED && wires.length > 0,
  };
};
