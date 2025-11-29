import { enableDevTools, isDevToolsEnabled, } from './runtime';
import { listSignals, getSignal, getDependencyGraph, getPerformanceMetrics, } from './inspector';
import { getProfilerData, } from './performanceProfiler';
let bridgeInitialized = false;
let currentTransport = null;
let messageQueue = [];
let messageSeq = 0;
let messageIdCounter = 0;
let batchTimer = null;
const defaultConfig = {
    transport: 'flipper',
    preferFlipper: true,
    websocketUrl: 'ws://localhost:8097',
    autoEnable: true,
    batchInterval: 100,
    maxQueueSize: 1000,
    verbose: false,
};
let config = { ...defaultConfig };
export async function initializeDevToolsBridge(options) {
    if (bridgeInitialized) {
        console.warn('[NativeBridge] Already initialized');
        return;
    }
    config = { ...defaultConfig, ...options };
    if (!shouldEnableBridge()) {
        log('Bridge disabled (production build or autoEnable=false)');
        currentTransport = new MockTransport();
        bridgeInitialized = true;
        return;
    }
    if (!isDevToolsEnabled()) {
        enableDevTools({
            trackPerformance: true,
            emitPerformanceWarnings: true,
        });
    }
    currentTransport = await createTransport();
    try {
        await currentTransport.connect();
        log(`Bridge connected via ${currentTransport.type}`);
    }
    catch (error) {
        console.error('[NativeBridge] Connection failed:', error);
        currentTransport = new MockTransport();
    }
    currentTransport.onMessage(handleIncomingMessage);
    setupEventListeners();
    await sendSnapshot();
    bridgeInitialized = true;
    log('Bridge initialized successfully');
}
export async function shutdownDevToolsBridge() {
    if (!bridgeInitialized) {
        return;
    }
    flushMessageQueue();
    if (currentTransport) {
        await currentTransport.disconnect();
        currentTransport = null;
    }
    messageQueue = [];
    messageSeq = 0;
    bridgeInitialized = false;
    log('Bridge shutdown');
}
export function isBridgeConnected() {
    return bridgeInitialized && currentTransport !== null && currentTransport.isConnected();
}
export function getBridgeConfig() {
    return config;
}
function shouldEnableBridge() {
    if (!config.autoEnable) {
        return false;
    }
    if (typeof __DEV__ !== 'undefined' && !__DEV__) {
        return false;
    }
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
        return false;
    }
    return true;
}
async function createTransport() {
    if (config.transport === 'websocket') {
        return new WebSocketTransport(config.websocketUrl);
    }
    if (config.transport === 'mock') {
        return new MockTransport();
    }
    if (config.preferFlipper && isFlipperAvailable()) {
        try {
            const transport = new FlipperTransport();
            await transport.connect();
            return transport;
        }
        catch (error) {
            log('Flipper not available, falling back to WebSocket');
        }
    }
    return new WebSocketTransport(config.websocketUrl);
}
function isFlipperAvailable() {
    try {
        const flipper = require('react-native-flipper');
        return !!flipper;
    }
    catch {
        return false;
    }
}
function handleIncomingMessage(message) {
    log('Received message:', message.type);
    if (message.type === 'command') {
        handleCommand(message);
    }
}
async function handleCommand(message) {
    const { command, args } = message.payload;
    let response;
    try {
        let data;
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
    }
    catch (error) {
        response = createResponseMessage(message.id, false, undefined, error instanceof Error ? error.message : 'Unknown error');
    }
    await sendMessage(response);
}
function setupEventListeners() {
    log('Event listeners setup complete');
}
async function sendSnapshot() {
    const snapshot = {
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
async function sendMessage(message) {
    if (!currentTransport || !currentTransport.isConnected()) {
        log('Transport not connected, message dropped');
        return;
    }
    messageQueue.push(message);
    if (messageQueue.length > config.maxQueueSize) {
        messageQueue.shift();
        log('Queue full, dropped oldest message');
    }
    if (!batchTimer) {
        batchTimer = setTimeout(flushMessageQueue, config.batchInterval);
    }
}
function flushMessageQueue() {
    if (batchTimer) {
        clearTimeout(batchTimer);
        batchTimer = null;
    }
    if (messageQueue.length === 0 || !currentTransport) {
        return;
    }
    const messages = [...messageQueue];
    messageQueue = [];
    Promise.all(messages.map(msg => currentTransport.send(msg)))
        .catch(error => {
        console.error('[NativeBridge] Failed to send messages:', error);
    });
}
function createResponseMessage(commandId, success, data, error) {
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
function generateMessageId() {
    return `msg_${++messageIdCounter}_${Date.now()}`;
}
function log(...args) {
    if (config.verbose) {
        console.log('[NativeBridge]', ...args);
    }
}
class FlipperTransport {
    constructor() {
        this.type = 'flipper';
        this.connected = false;
        this.flipperConnection = null;
        this.messageHandler = null;
    }
    isConnected() {
        return this.connected;
    }
    async connect() {
        try {
            const { addPlugin } = require('react-native-flipper');
            addPlugin({
                getId: () => 'SignalForge',
                onConnect: (connection) => {
                    this.flipperConnection = connection;
                    this.connected = true;
                    connection.receive('command', (data) => {
                        if (this.messageHandler) {
                            this.messageHandler(data);
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
        }
        catch (error) {
            throw new Error(`Flipper connection failed: ${error}`);
        }
    }
    async disconnect() {
        this.connected = false;
        this.flipperConnection = null;
    }
    async send(message) {
        if (!this.flipperConnection) {
            throw new Error('Flipper not connected');
        }
        this.flipperConnection.send(message.type, message);
    }
    onMessage(handler) {
        this.messageHandler = handler;
    }
}
class WebSocketTransport {
    constructor(url) {
        this.url = url;
        this.type = 'websocket';
        this.connected = false;
        this.ws = null;
        this.messageHandler = null;
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    isConnected() {
        return this.connected && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
    async connect() {
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
                        const message = JSON.parse(event.data);
                        if (this.messageHandler) {
                            this.messageHandler(message);
                        }
                    }
                    catch (error) {
                        console.error('[NativeBridge] Failed to parse message:', error);
                    }
                };
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async disconnect() {
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
    async send(message) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }
        const json = JSON.stringify(message);
        this.ws.send(json);
    }
    onMessage(handler) {
        this.messageHandler = handler;
    }
    attemptReconnect() {
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
class MockTransport {
    constructor() {
        this.type = 'mock';
    }
    isConnected() {
        return false;
    }
    async connect() {
    }
    async disconnect() {
    }
    async send(_message) {
    }
    onMessage(_handler) {
    }
}
export async function notifySignalCreated(signalId, metadata) {
    const message = {
        type: 'signal-created',
        id: generateMessageId(),
        seq: messageSeq++,
        timestamp: Date.now(),
        payload: { signalId, metadata },
    };
    await sendMessage(message);
}
export async function notifySignalUpdated(signalId, previousValue, newValue) {
    const message = {
        type: 'signal-updated',
        id: generateMessageId(),
        seq: messageSeq++,
        timestamp: Date.now(),
        payload: { signalId, previousValue, newValue },
    };
    await sendMessage(message);
}
export async function notifyPerformanceMetric(metric) {
    const message = {
        type: 'performance-metric',
        id: generateMessageId(),
        seq: messageSeq++,
        timestamp: Date.now(),
        payload: metric,
    };
    await sendMessage(message);
}
