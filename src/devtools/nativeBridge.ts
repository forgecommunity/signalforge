/**
 * SignalForge DevTools Bridge for React Native
 * 
 * PURPOSE:
 * ========
 * Bridge for live inspection of SignalForge state in React Native apps using
 * Flipper plugin or WebSocket connection. Mirrors the web DevTools dashboard
 * with real-time signal updates, dependency graphs, and performance metrics.
 * 
 * FEATURES:
 * - Live signal inspection inside React Native apps
 * - Flipper plugin integration for official debugging
 * - WebSocket fallback for standalone debugging
 * - JSON serialization for cross-platform message passing
 * - Real-time updates, plugin info, and performance data
 * - Auto-enables bridge when Flipper or debug mode is active
 * - Zero overhead in production builds
 * 
 * ARCHITECTURE:
 * =============
 * 
 * 1. Connection Flow:
 *    App Start → detectEnvironment() → Check Flipper OR Debug Mode
 *    → Initialize Transport (Flipper/WebSocket) → Connect to DevTools
 *    → Start Event Streaming
 * 
 * 2. Message Flow:
 *    Runtime Event → Serialize to JSON → Send via Transport
 *    → DevTools UI receives → Display in dashboard
 * 
 * 3. Command Flow:
 *    DevTools UI Action → Command Message → Transport → Bridge
 *    → Execute Action (inspect signal, update value) → Send Response
 * 
 * 4. Transport Hierarchy:
 *    FlipperTransport (preferred) → WebSocketTransport (fallback)
 *    → MockTransport (testing/disabled)
 * 
 * INTEGRATION:
 * ============
 * 
 * Flipper Plugin:
 * ```typescript
 * import { initializeDevToolsBridge } from 'signalforge/devtools/nativeBridge';
 * initializeDevToolsBridge({ preferFlipper: true });
 * ```
 * 
 * WebSocket:
 * ```typescript
 * initializeDevToolsBridge({ 
 *   transport: 'websocket',
 *   websocketUrl: 'ws://localhost:8097'
 * });
 * ```
 * 
 * @module nativeBridge
 */

import {
  enableDevTools,
  disableDevTools,
  isDevToolsEnabled,
  type DevToolsEvent,
  type SignalMetadata,
  type PerformanceMetric,
} from './runtime';

import {
  listSignals,
  getSignal,
  getDependencyGraph,
  getPerformanceMetrics,
  type DependencyNode,
} from './inspector';

import {
  getProfilerData,
  type ProfilerData,
} from './performanceProfiler';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Transport types for bridge communication
 */
export type TransportType = 'flipper' | 'websocket' | 'mock';

/**
 * Bridge configuration options
 */
export interface BridgeConfig {
  /** Preferred transport (auto-detected if not specified) */
  transport?: TransportType;
  /** Whether to prefer Flipper over WebSocket */
  preferFlipper?: boolean;
  /** WebSocket server URL (only for websocket transport) */
  websocketUrl?: string;
  /** Auto-enable bridge in debug mode */
  autoEnable?: boolean;
  /** Batch message interval (ms) */
  batchInterval?: number;
  /** Maximum message queue size */
  maxQueueSize?: number;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Message types for bridge communication
 */
export type MessageType =
  | 'signal-created'
  | 'signal-updated'
  | 'signal-destroyed'
  | 'dependency-added'
  | 'dependency-removed'
  | 'performance-metric'
  | 'profiler-data'
  | 'snapshot'
  | 'command'
  | 'response'
  | 'error';

/**
 * Base message structure
 */
export interface BridgeMessage {
  /** Message type */
  type: MessageType;
  /** Message payload */
  payload: any;
  /** Timestamp */
  timestamp: number;
  /** Unique message ID */
  id: string;
  /** Sequence number */
  seq: number;
}

/**
 * Command message from DevTools → App
 */
export interface CommandMessage extends BridgeMessage {
  type: 'command';
  payload: {
    /** Command name */
    command: string;
    /** Command arguments */
    args: any[];
  };
}

/**
 * Response message from App → DevTools
 */
export interface ResponseMessage extends BridgeMessage {
  type: 'response';
  payload: {
    /** Original command ID */
    commandId: string;
    /** Success status */
    success: boolean;
    /** Response data */
    data?: any;
    /** Error message if failed */
    error?: string;
  };
}

/**
 * Snapshot message with complete state
 */
export interface SnapshotMessage extends BridgeMessage {
  type: 'snapshot';
  payload: {
    /** All signals */
    signals: SignalMetadata[];
    /** Dependency graph */
    dependencies: DependencyNode[];
    /** Performance metrics */
    performance: PerformanceMetric[];
    /** Profiler data */
    profiler: ProfilerData | null;
  };
}

/**
 * Transport interface for different communication methods
 */
export interface Transport {
  /** Transport type */
  readonly type: TransportType;
  /** Whether transport is connected */
  isConnected(): boolean;
  /** Connect to DevTools */
  connect(): Promise<void>;
  /** Disconnect from DevTools */
  disconnect(): Promise<void>;
  /** Send message to DevTools */
  send(message: BridgeMessage): Promise<void>;
  /** Register message handler */
  onMessage(handler: (message: BridgeMessage) => void): void;
}

// ============================================================================
// Global State
// ============================================================================

let bridgeInitialized = false;
let currentTransport: Transport | null = null;
let messageQueue: BridgeMessage[] = [];
let messageSeq = 0;
let messageIdCounter = 0;
let batchTimer: any = null;

const defaultConfig: Required<BridgeConfig> = {
  transport: 'flipper',
  preferFlipper: true,
  websocketUrl: 'ws://localhost:8097',
  autoEnable: true,
  batchInterval: 100,
  maxQueueSize: 1000,
  verbose: false,
};

let config: Required<BridgeConfig> = { ...defaultConfig };

// ============================================================================
// Core API - Bridge Control
// ============================================================================

/**
 * Initialize DevTools bridge for React Native
 * 
 * Auto-detects environment and chooses best transport:
 * 1. Flipper (if available and preferFlipper = true)
 * 2. WebSocket (if Flipper unavailable or preferFlipper = false)
 * 3. Mock (if neither available or production build)
 * 
 * @param options - Bridge configuration
 * 
 * @example
 * ```typescript
 * // Auto-detect (prefer Flipper)
 * initializeDevToolsBridge();
 * 
 * // Force WebSocket
 * initializeDevToolsBridge({ 
 *   transport: 'websocket',
 *   websocketUrl: 'ws://192.168.1.100:8097'
 * });
 * 
 * // Flipper with custom config
 * initializeDevToolsBridge({
 *   preferFlipper: true,
 *   batchInterval: 50,
 *   verbose: true,
 * });
 * ```
 */
export async function initializeDevToolsBridge(options?: BridgeConfig): Promise<void> {
  if (bridgeInitialized) {
    console.warn('[NativeBridge] Already initialized');
    return;
  }

  // Merge config
  config = { ...defaultConfig, ...options };

  // Check if we should enable
  if (!shouldEnableBridge()) {
    log('Bridge disabled (production build or autoEnable=false)');
    currentTransport = new MockTransport();
    bridgeInitialized = true;
    return;
  }

  // Enable DevTools runtime
  if (!isDevToolsEnabled()) {
    enableDevTools({
      trackPerformance: true,
      emitPerformanceWarnings: true,
    });
  }

  // Detect and create transport
  currentTransport = await createTransport();
  
  // Connect
  try {
    await currentTransport.connect();
    log(`Bridge connected via ${currentTransport.type}`);
  } catch (error) {
    console.error('[NativeBridge] Connection failed:', error);
    currentTransport = new MockTransport();
  }

  // Register message handler
  currentTransport.onMessage(handleIncomingMessage);

  // Start listening to runtime events
  setupEventListeners();

  // Send initial snapshot
  await sendSnapshot();

  bridgeInitialized = true;
  log('Bridge initialized successfully');
}

/**
 * Disconnect and cleanup bridge
 * 
 * @example
 * ```typescript
 * await shutdownDevToolsBridge();
 * ```
 */
export async function shutdownDevToolsBridge(): Promise<void> {
  if (!bridgeInitialized) {
    return;
  }

  // Flush pending messages
  flushMessageQueue();

  // Disconnect transport
  if (currentTransport) {
    await currentTransport.disconnect();
    currentTransport = null;
  }

  // Clear state
  messageQueue = [];
  messageSeq = 0;
  bridgeInitialized = false;

  log('Bridge shutdown');
}

/**
 * Check if bridge is initialized and connected
 * 
 * @returns True if bridge is active
 */
export function isBridgeConnected(): boolean {
  return bridgeInitialized && currentTransport !== null && currentTransport.isConnected();
}

/**
 * Get current bridge configuration
 * 
 * @returns Current config
 */
export function getBridgeConfig(): Readonly<Required<BridgeConfig>> {
  return config;
}

// ============================================================================
// Internal - Transport Detection & Creation
// ============================================================================

/**
 * Check if bridge should be enabled
 */
function shouldEnableBridge(): boolean {
  // Skip if explicitly disabled
  if (!config.autoEnable) {
    return false;
  }

  // Check for production build
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return false;
  }

  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return false;
  }

  return true;
}

/**
 * Detect environment and create appropriate transport
 */
async function createTransport(): Promise<Transport> {
  // If specific transport requested, use it
  if (config.transport === 'websocket') {
    return new WebSocketTransport(config.websocketUrl);
  }

  if (config.transport === 'mock') {
    return new MockTransport();
  }

  // Auto-detect: prefer Flipper if available
  if (config.preferFlipper && isFlipperAvailable()) {
    try {
      const transport = new FlipperTransport();
      await transport.connect();
      return transport;
    } catch (error) {
      log('Flipper not available, falling back to WebSocket');
    }
  }

  // Fallback to WebSocket
  return new WebSocketTransport(config.websocketUrl);
}

/**
 * Check if Flipper is available
 */
function isFlipperAvailable(): boolean {
  try {
    // Check for react-native-flipper
    // @ts-ignore - May not be installed
    const flipper = require('react-native-flipper');
    return !!flipper;
  } catch {
    return false;
  }
}

// ============================================================================
// Internal - Message Handling
// ============================================================================

/**
 * Handle incoming command messages from DevTools
 */
function handleIncomingMessage(message: BridgeMessage): void {
  log('Received message:', message.type);

  if (message.type === 'command') {
    handleCommand(message as CommandMessage);
  }
}

/**
 * Execute command from DevTools
 */
async function handleCommand(message: CommandMessage): Promise<void> {
  const { command, args } = message.payload;
  
  let response: ResponseMessage;
  
  try {
    let data: any;
    
    switch (command) {
      case 'listSignals':
        data = listSignals();
        break;
        
      case 'getSignal':
        data = getSignal(args[0]);
        break;
        
      case 'getDependencyGraph':
        data = getDependencyGraph();
        break;
        
      case 'getPerformanceMetrics':
        data = getPerformanceMetrics(args[0]);
        break;
        
      case 'getProfilerData':
        data = getProfilerData();
        break;
        
      case 'requestSnapshot':
        await sendSnapshot();
        data = { success: true };
        break;
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
    response = createResponseMessage(message.id, true, data);
  } catch (error) {
    response = createResponseMessage(
      message.id,
      false,
      undefined,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
  
  await sendMessage(response);
}

/**
 * Setup event listeners for runtime events
 */
function setupEventListeners(): void {
  // Listen to DevTools runtime events
  // Note: This would integrate with the runtime event emitter
  // For now, we'll rely on manual calls to sendMessage for updates
  
  log('Event listeners setup complete');
}

/**
 * Send complete state snapshot to DevTools
 */
async function sendSnapshot(): Promise<void> {
  const snapshot: SnapshotMessage = {
    type: 'snapshot',
    id: generateMessageId(),
    seq: messageSeq++,
    timestamp: Date.now(),
    payload: {
      signals: listSignals(),
      dependencies: getDependencyGraph(),
      performance: getPerformanceMetrics(),
      profiler: getProfilerData(),
    },
  };
  
  await sendMessage(snapshot);
  log('Snapshot sent');
}

/**
 * Send message via transport (with batching)
 */
async function sendMessage(message: BridgeMessage): Promise<void> {
  if (!currentTransport || !currentTransport.isConnected()) {
    log('Transport not connected, message dropped');
    return;
  }
  
  // Add to queue
  messageQueue.push(message);
  
  // Check queue size limit
  if (messageQueue.length > config.maxQueueSize) {
    messageQueue.shift(); // Drop oldest
    log('Queue full, dropped oldest message');
  }
  
  // Schedule batch flush
  if (!batchTimer) {
    batchTimer = setTimeout(flushMessageQueue, config.batchInterval);
  }
}

/**
 * Flush queued messages
 */
function flushMessageQueue(): void {
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }
  
  if (messageQueue.length === 0 || !currentTransport) {
    return;
  }
  
  const messages = [...messageQueue];
  messageQueue = [];
  
  // Send all queued messages
  Promise.all(messages.map(msg => currentTransport!.send(msg)))
    .catch(error => {
      console.error('[NativeBridge] Failed to send messages:', error);
    });
}

/**
 * Create response message
 */
function createResponseMessage(
  commandId: string,
  success: boolean,
  data?: any,
  error?: string
): ResponseMessage {
  return {
    type: 'response',
    id: generateMessageId(),
    seq: messageSeq++,
    timestamp: Date.now(),
    payload: {
      commandId,
      success,
      data,
      error,
    },
  };
}

/**
 * Generate unique message ID
 */
function generateMessageId(): string {
  return `msg_${++messageIdCounter}_${Date.now()}`;
}

/**
 * Log helper
 */
function log(...args: any[]): void {
  if (config.verbose) {
    console.log('[NativeBridge]', ...args);
  }
}

// ============================================================================
// Transport Implementations
// ============================================================================

/**
 * Flipper transport implementation
 */
class FlipperTransport implements Transport {
  readonly type: TransportType = 'flipper';
  private connected = false;
  private flipperConnection: any = null;
  private messageHandler: ((message: BridgeMessage) => void) | null = null;

  isConnected(): boolean {
    return this.connected;
  }

  async connect(): Promise<void> {
    try {
      // @ts-ignore
      const { addPlugin } = require('react-native-flipper');
      
      addPlugin({
        getId: () => 'SignalForge',
        onConnect: (connection: any) => {
          this.flipperConnection = connection;
          this.connected = true;
          
          // Listen for messages from Flipper
          connection.receive('command', (data: any) => {
            if (this.messageHandler) {
              this.messageHandler(data as BridgeMessage);
            }
          });
          
          log('Flipper connected');
        },
        onDisconnect: () => {
          this.connected = false;
          this.flipperConnection = null;
          log('Flipper disconnected');
        },
        runInBackground: () => true,
      });
    } catch (error) {
      throw new Error(`Flipper connection failed: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.flipperConnection = null;
  }

  async send(message: BridgeMessage): Promise<void> {
    if (!this.flipperConnection) {
      throw new Error('Flipper not connected');
    }
    
    this.flipperConnection.send(message.type, message);
  }

  onMessage(handler: (message: BridgeMessage) => void): void {
    this.messageHandler = handler;
  }
}

/**
 * WebSocket transport implementation
 */
class WebSocketTransport implements Transport {
  readonly type: TransportType = 'websocket';
  private connected = false;
  private ws: WebSocket | null = null;
  private messageHandler: ((message: BridgeMessage) => void) | null = null;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor(private url: string) {}

  isConnected(): boolean {
    return this.connected && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          log('WebSocket connected');
          resolve();
        };
        
        this.ws.onclose = () => {
          this.connected = false;
          log('WebSocket closed');
          this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('[NativeBridge] WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as BridgeMessage;
            if (this.messageHandler) {
              this.messageHandler(message);
            }
          } catch (error) {
            console.error('[NativeBridge] Failed to parse message:', error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.connected = false;
  }

  async send(message: BridgeMessage): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }
    
    const json = JSON.stringify(message);
    this.ws.send(json);
  }

  onMessage(handler: (message: BridgeMessage) => void): void {
    this.messageHandler = handler;
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      log('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[NativeBridge] Reconnect failed:', error);
      });
    }, delay);
  }
}

/**
 * Mock transport (no-op for production or disabled)
 */
class MockTransport implements Transport {
  readonly type: TransportType = 'mock';

  isConnected(): boolean {
    return false;
  }

  async connect(): Promise<void> {
    // No-op
  }

  async disconnect(): Promise<void> {
    // No-op
  }

  async send(_message: BridgeMessage): Promise<void> {
    // No-op
  }

  onMessage(_handler: (message: BridgeMessage) => void): void {
    // No-op
  }
}

// ============================================================================
// Public API - Message Sending
// ============================================================================

/**
 * Send signal created event to DevTools
 * 
 * @param signalId - Signal ID
 * @param metadata - Signal metadata
 */
export async function notifySignalCreated(signalId: string, metadata: SignalMetadata): Promise<void> {
  const message: BridgeMessage = {
    type: 'signal-created',
    id: generateMessageId(),
    seq: messageSeq++,
    timestamp: Date.now(),
    payload: { signalId, metadata },
  };
  
  await sendMessage(message);
}

/**
 * Send signal updated event to DevTools
 * 
 * @param signalId - Signal ID
 * @param previousValue - Previous value
 * @param newValue - New value
 */
export async function notifySignalUpdated(
  signalId: string,
  previousValue: any,
  newValue: any
): Promise<void> {
  const message: BridgeMessage = {
    type: 'signal-updated',
    id: generateMessageId(),
    seq: messageSeq++,
    timestamp: Date.now(),
    payload: { signalId, previousValue, newValue },
  };
  
  await sendMessage(message);
}

/**
 * Send performance metric to DevTools
 * 
 * @param metric - Performance metric
 */
export async function notifyPerformanceMetric(metric: PerformanceMetric): Promise<void> {
  const message: BridgeMessage = {
    type: 'performance-metric',
    id: generateMessageId(),
    seq: messageSeq++,
    timestamp: Date.now(),
    payload: metric,
  };
  
  await sendMessage(message);
}
