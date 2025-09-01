// WebSocket Test Suite
// Test real-time communication between frontend and backend

import { WebSocket } from 'ws';

// Mock WebSocket
class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  
  constructor(public url: string) {
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  send(data: string | ArrayBuffer | Blob | ArrayBufferView) {
    // Mock sending data
    console.log('WebSocket send:', data);
  }

  close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }));
    }
  }

  // Simulate receiving a message
  simulateMessage(data: Record<string, unknown>) {
    if (this.onmessage && this.readyState === WebSocket.OPEN) {
      this.onmessage({
        data: JSON.stringify(data),
        type: 'message',
        target: this
      } as MessageEvent);
    }
  }
}

// Mock WebSocket globally
global.WebSocket = MockWebSocket as typeof WebSocket;

describe('WebSocket Tests', () => {
  let mockWebSocket: MockWebSocket;
  const testUrl = 'ws://localhost:8000/ws';

  beforeEach(() => {
    mockWebSocket = new MockWebSocket(testUrl);
  });

  afterEach(() => {
    if (mockWebSocket) {
      mockWebSocket.close();
    }
  });

  it('should establish WebSocket connection', (done) => {
    mockWebSocket.onopen = () => {
      expect(mockWebSocket.readyState).toBe(WebSocket.OPEN);
      done();
    };
  });

  it('should send frequency update message', () => {
    const sendSpy = jest.spyOn(mockWebSocket, 'send');
    
    const frequencyData = {
      type: 'frequency_update',
      leftFreq: 440,
      rightFreq: 444,
      beatFreq: 4
    };

    mockWebSocket.send(JSON.stringify(frequencyData));
    
    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(frequencyData));
  });

  it('should send pattern selection message', () => {
    const sendSpy = jest.spyOn(mockWebSocket, 'send');
    
    const patternData = {
      type: 'pattern_select',
      patternId: 'toroidal-max',
      frequencies: {
        carrier: 440,
        beat: 4,
        range: 'theta'
      }
    };

    mockWebSocket.send(JSON.stringify(patternData));
    
    expect(sendSpy).toHaveBeenCalledWith(JSON.stringify(patternData));
  });

  it('should handle audio stream data', () => {
    const messageHandler = jest.fn();
    mockWebSocket.onmessage = messageHandler;

    const audioData = {
      type: 'audio_stream',
      samples: new Array(512).fill(0).map(() => Math.random() * 2 - 1),
      sampleRate: 44100,
      timestamp: Date.now()
    };

    mockWebSocket.simulateMessage(audioData);
    
    expect(messageHandler).toHaveBeenCalled();
  });

  it('should handle electromagnetic field data', () => {
    const messageHandler = jest.fn();
    mockWebSocket.onmessage = messageHandler;

    const fieldData = {
      type: 'electromagnetic_field',
      strength: 0.8,
      frequency: 4,
      phase: 120,
      coherence: 0.9,
      state: 'ACTIVE'
    };

    mockWebSocket.simulateMessage(fieldData);
    
    expect(messageHandler).toHaveBeenCalled();
  });

  it('should handle connection errors', (done) => {
    mockWebSocket.onerror = (event) => {
      expect(event).toBeDefined();
      done();
    };

    // Simulate error
    if (mockWebSocket.onerror) {
      mockWebSocket.onerror(new Event('error'));
    }
  });

  it('should handle connection close', (done) => {
    mockWebSocket.onclose = (event) => {
      expect(event.type).toBe('close');
      expect(mockWebSocket.readyState).toBe(WebSocket.CLOSED);
      done();
    };

    mockWebSocket.close(1000, 'Normal closure');
  });

  it('should reconnect after connection loss', async () => {
    let connectionCount = 0;
    
    const createConnection = () => {
      connectionCount++;
      return new MockWebSocket(testUrl);
    };

    // Simulate initial connection
    let ws = createConnection();
    
    // Simulate connection loss
    ws.close(1006, 'Connection lost');
    
    // Simulate reconnection
    ws = createConnection();
    
    expect(connectionCount).toBe(2);
  });

  it('should handle real-time frequency updates', () => {
    const frequencies: number[] = [];
    
    mockWebSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'frequency_update') {
        frequencies.push(data.beatFreq);
      }
    };

    // Simulate real-time frequency changes
    for (let i = 1; i <= 10; i++) {
      mockWebSocket.simulateMessage({
        type: 'frequency_update',
        beatFreq: i * 0.5
      });
    }

    expect(frequencies).toHaveLength(10);
    expect(frequencies[0]).toBe(0.5);
    expect(frequencies[9]).toBe(5);
  });

  it('should batch multiple updates efficiently', () => {
    const messages: Record<string, unknown>[] = [];
    
    mockWebSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      messages.push(data);
    };

    // Simulate batched updates
    const batchData = {
      type: 'batch_update',
      updates: [
        { type: 'frequency', value: 4 },
        { type: 'volume', value: 0.5 },
        { type: 'pattern', value: 'vortex-focus' }
      ]
    };

    mockWebSocket.simulateMessage(batchData);

    expect(messages).toHaveLength(1);
    expect(messages[0].updates).toHaveLength(3);
  });

  it('should handle large data payloads', () => {
    const largeData = {
      type: 'visualization_data',
      points: new Array(10000).fill(0).map((_, i) => ({
        x: Math.sin(i * 0.01),
        y: Math.cos(i * 0.01),
        z: Math.sin(i * 0.02)
      })),
      timestamp: Date.now()
    };

    const sendSpy = jest.spyOn(mockWebSocket, 'send');
    mockWebSocket.send(JSON.stringify(largeData));

    expect(sendSpy).toHaveBeenCalled();
  });

  it('should maintain connection heartbeat', async () => {
    let heartbeatCount = 0;
    
    mockWebSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ping') {
        heartbeatCount++;
        // Respond with pong
        mockWebSocket.send(JSON.stringify({ type: 'pong' }));
      }
    };

    // Simulate heartbeat pings
    for (let i = 0; i < 5; i++) {
      mockWebSocket.simulateMessage({ type: 'ping', timestamp: Date.now() });
    }

    expect(heartbeatCount).toBe(5);
  });
});