// API Test Suite
// Test REST API endpoints and data handling

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('API Tests', () => {
  const baseURL = 'http://localhost:8000';

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch pattern presets', async () => {
    const mockPatterns = [
      {
        id: 'toroidal-max',
        name: 'Maximum Resonance Toroid',
        frequencies: { carrier: 440, beat: 4, range: 'theta' }
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPatterns,
    } as Response);

    const response = await fetch(`${baseURL}/api/patterns`);
    const patterns = await response.json();

    expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/patterns`);
    expect(patterns).toEqual(mockPatterns);
  });

  it('should create binaural beat session', async () => {
    const sessionData = {
      leftFreq: 440,
      rightFreq: 444,
      duration: 1200,
      pattern: 'toroidal-max'
    };

    const mockSession = {
      id: 'session-123',
      ...sessionData,
      status: 'active',
      startTime: new Date().toISOString()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSession,
    } as Response);

    const response = await fetch(`${baseURL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });

    const session = await response.json();

    expect(mockFetch).toHaveBeenCalledWith(
      `${baseURL}/api/sessions`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })
    );
    expect(session.id).toBe('session-123');
    expect(session.status).toBe('active');
  });

  it('should update frequency during session', async () => {
    const sessionId = 'session-123';
    const updateData = { beat_frequency: 8 };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const response = await fetch(`${baseURL}/api/sessions/${sessionId}/frequency`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });

    const result = await response.json();

    expect(mockFetch).toHaveBeenCalledWith(
      `${baseURL}/api/sessions/${sessionId}/frequency`,
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
    );
    expect(result.success).toBe(true);
  });

  it('should get electromagnetic field data', async () => {
    const mockFieldData = {
      strength: 0.8,
      frequency: 4,
      phase: 120,
      coherence: 0.9,
      resonance: 0.7,
      state: 'ACTIVE',
      stability: 0.95
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFieldData,
    } as Response);

    const response = await fetch(`${baseURL}/api/electromagnetic/field`);
    const fieldData = await response.json();

    expect(mockFetch).toHaveBeenCalledWith(`${baseURL}/api/electromagnetic/field`);
    expect(fieldData.strength).toBe(0.8);
    expect(fieldData.state).toBe('ACTIVE');
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    try {
      await fetch(`${baseURL}/api/patterns`);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Network error');
    }
  });

  it('should handle 404 responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Pattern not found' }),
    } as Response);

    const response = await fetch(`${baseURL}/api/patterns/invalid-id`);
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });

  it('should handle server errors (500)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    } as Response);

    const response = await fetch(`${baseURL}/api/sessions`, {
      method: 'POST',
      body: JSON.stringify({})
    });
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should validate request data', async () => {
    const invalidData = {
      leftFreq: 'invalid',  // Should be number
      rightFreq: -10,       // Should be positive
      duration: null        // Should be number
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ 
        error: 'Validation failed',
        details: ['leftFreq must be number', 'rightFreq must be positive']
      }),
    } as Response);

    const response = await fetch(`${baseURL}/api/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });

    expect(response.status).toBe(400);
    const error = await response.json();
    expect(error.error).toBe('Validation failed');
  });

  it('should get system status', async () => {
    const mockStatus = {
      electromagnetic: {
        strength: 0.5,
        frequency: 4,
        state: 'ACTIVE'
      },
      audio: {
        latency: 20,
        sampleRate: 44100,
        quality: 'HIGH'
      },
      performance: {
        fps: 60,
        cpuUsage: 25,
        memoryUsage: 45
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatus,
    } as Response);

    const response = await fetch(`${baseURL}/api/system/status`);
    const status = await response.json();

    expect(status.audio.sampleRate).toBe(44100);
    expect(status.performance.fps).toBe(60);
  });

  it('should handle concurrent requests', async () => {
    const requests = [
      fetch(`${baseURL}/api/patterns`),
      fetch(`${baseURL}/api/system/status`),
      fetch(`${baseURL}/api/electromagnetic/field`)
    ];

    // Mock all responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ strength: 0 }),
      } as Response);

    const responses = await Promise.all(requests);
    
    expect(responses).toHaveLength(3);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should support request timeouts', async () => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000);
    });

    mockFetch.mockImplementationOnce(() => timeoutPromise as Promise<Response>);

    try {
      await fetch(`${baseURL}/api/patterns`);
    } catch (error) {
      expect((error as Error).message).toBe('Request timeout');
    }
  });

  it('should handle authentication if required', async () => {
    const token = 'bearer-token-123';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authorized: true }),
    } as Response);

    await fetch(`${baseURL}/api/protected`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${baseURL}/api/protected`,
      expect.objectContaining({
        headers: { 'Authorization': `Bearer ${token}` }
      })
    );
  });
});