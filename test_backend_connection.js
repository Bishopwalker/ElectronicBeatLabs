// Simple test to debug backend connection
const WebSocket = require('ws');

const BACKEND_URL = "http://localhost:8000";
const WS_URL = "ws://localhost:8000/ws/audio";

async function testBackendConnection() {
    console.log("=== DEBUGGING BACKEND CONNECTION ===");

    // Test 1: Health check
    console.log("\n1. Testing health endpoint...");
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        const data = await response.json();
        console.log("✅ Health check:", data);
    } catch (error) {
        console.log("❌ Health check failed:", error.message);
        return;
    }

    // Test 2: WebSocket connection
    console.log("\n2. Testing WebSocket connection...");
    try {
        const ws = new WebSocket(WS_URL);

        ws.on('open', () => {
            console.log("✅ WebSocket connected");

            // Test 3: Send start_stream message
            console.log("\n3. Sending start_stream message...");
            const startMessage = {
                type: "start_stream",
                data: {
                    base_frequency: 440,
                    beat_frequency: 4,
                    amplitude: 0.5,
                    waveform: "sine"
                }
            };

            ws.send(JSON.stringify(startMessage));
            console.log("📤 Sent:", startMessage);
        });

        ws.on('message', (data) => {
            const message = JSON.parse(data.toString());
            console.log("📥 Received:", message.type, message.data ? "with data" : "");

            if (message.type === 'audio_frame' || message.type === 'frame') {
                const audioData = message.type === 'frame' ? message.data?.audio : message.data;
                if (audioData?.frequencies) {
                    console.log("   🎵 Frequencies:", audioData.frequencies);
                }

                // Close after receiving first frame
                ws.close();
                console.log("\n✅ Backend audio streaming is working!");
            }
        });

        ws.on('error', (error) => {
            console.log("❌ WebSocket error:", error.message);
        });

        ws.on('close', () => {
            console.log("🔌 WebSocket closed");
        });

    } catch (error) {
        console.log("❌ WebSocket connection failed:", error.message);
    }
}

testBackendConnection();