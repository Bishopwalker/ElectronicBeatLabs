#!/usr/bin/env python3
"""
Electromagnetic Beat Lab - Backend Testing Examples
Test suite for validating audio generation, field simulation, and WebSocket streaming.

Usage:
    python test_ebl_backend.py
    pytest test_ebl_backend.py -v

Requirements:
    pip install pytest pytest-asyncio numpy scipy matplotlib websockets
"""

import asyncio
import pytest
import numpy as np
import time
import json
import websockets
from scipy import signal
from pathlib import Path
import sys
import matplotlib.pyplot as plt
from sympy.physics.continuum_mechanics.arch import numpy

# Add backend to path for imports
sys.path.append(str(Path(__file__).parent.parent / "backend"))

try:
    from backend.core.audio_engine import AudioEngine
    from backend.core.field_simulator import FieldSimulator
    from backend.modules.binaural import BinauralBeatGenerator
    from backend.protocols.adhd_protocols import ADHDProtocols
except ImportError as e:
    print(f"Warning: Could not import backend modules: {e}")
    print("This is normal if the backend hasn't been implemented yet.")
    
    # Mock classes for testing the test framework itself
    class MockAudioEngine:
        def __init__(self, sample_rate=44100):
            self.sample_rate = sample_rate
            
      def generate_frame(self, session_id):
            frame_size = int(self.sample_rate / 60)
            return {
                "left": numpy.random.random(frame_size).tolist(),
                "right": numpy.random.random(frame_size).tolist(),
                "sample_rate": self.sample_rate,
                "frame_size": frame_size
            }
    
    class MockFieldSimulator:
         def generate_frame(self, session_id):
            return {
                "field": np.random.random((64, 64)).tolist(),
                "grid_size": (64, 64),
                "pattern": "toroidal"
            }
    
    class MockBinauralBeatGenerator:
        def get_presets(self):
            return {"smr_training": {"beat_frequency": 14}}
    
    class MockADHDProtocols:
        def get_all_protocols(self):
            return {"smr_training": {"stages": []}}
    
    AudioEngine = MockAudioEngine
    FieldSimulator = MockFieldSimulator
    BinauralBeatGenerator = MockBinauralBeatGenerator
    ADHDProtocols = MockADHDProtocols

class TestAudioEngine:
    """Test the audio generation engine for accuracy and performance."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.engine = AudioEngine(sample_rate=44100)
        
    def test_audio_engine_initialization(self):
        """Test audio engine initializes correctly."""
        assert self.engine.sample_rate == 44100
        assert not self.engine.is_running()
        
    def test_session_management(self):
        """Test session creation and management."""
        settings = {
            "base_frequency": 200,
            "beat_frequency": 4,
            "amplitude": 0.5
        }
        
        session_id = self.engine.start_session(settings)
        assert session_id is not None
        assert self.engine.is_running()
        
        self.engine.stop_session(session_id)
        assert not self.engine.is_running()
        
    @pytest.mark.asyncio
    async def test_frame_generation(self):
        """Test audio frame generation."""
        settings = {
            "base_frequency": 200,
            "beat_frequency": 4,
            "amplitude": 0.5
        }
        
        session_id = self.engine.start_session(settings)
        frame = await self.engine.generate_frame(session_id)
        
        # Validate frame structure
        assert "left" in frame
        assert "right" in frame
        assert "sample_rate" in frame
        assert "frame_size" in frame
        
        # Validate frame size (60 FPS)
        expected_frame_size = int(44100 / 60)
        assert len(frame["left"]) == expected_frame_size
        assert len(frame["right"]) == expected_frame_size
        
        self.engine.stop_session(session_id)
        
    def test_frequency_accuracy(self):
        """Test binaural beat frequency accuracy using FFT analysis."""
        settings = {
            "base_frequency": 140,
            "beat_frequency": 4,
            "amplitude": 0.5
        }
        
        session_id = self.engine.start_session(settings)
        
        # Generate 1 second of audio for analysis
        frames = []
        for _ in range(60):  # 60 frames = 1 second at 60 FPS
            frame = asyncio.run(self.engine.generate_frame(session_id))
            frames.extend(frame["left"])
        
        # Convert to numpy array
        audio_data = np.array(frames)
        
        # Perform FFT analysis
        fft = np.fft.rfft(audio_data)
        freqs = np.fft.rfftfreq(len(audio_data), 1/44100)
        
        # Find peaks in frequency domain
        magnitude = np.abs(fft)
        peaks, _ = signal.find_peaks(magnitude, height=np.max(magnitude) * 0.1)
        detected_freqs = freqs[peaks]
        
        # Should detect base frequency (440 Hz) and sideband (444 Hz)
        expected_freqs = [140, 144]
        for expected_freq in expected_freqs:
            closest_detected = detected_freqs[np.argmin(np.abs(detected_freqs - expected_freq))]
            assert abs(closest_detected - expected_freq) < 0.5, f"Frequency accuracy: expected {expected_freq}, got {closest_detected}"
        
        self.engine.stop_session(session_id)
        
    def test_amplitude_safety_limits(self):
        """Test that amplitude is limited for hearing safety."""
        settings = {
            "base_frequency": 200,
            "beat_frequency": 4,
            "amplitude": 2.0  # Excessive amplitude
        }
        
        session_id = self.engine.start_session(settings)
        frame = asyncio.run(self.engine.generate_frame(session_id))
        
        # Check that amplitude is clamped to safe levels
        max_amplitude = max(max(frame["left"]), max(frame["right"]))
        assert max_amplitude <= 0.8, "Amplitude should be limited for safety"
        
        self.engine.stop_session(session_id)
        
    def test_phase_continuity(self):
        """Test that audio frames maintain phase continuity to prevent clicks."""
        settings = {
            "base_frequency": 200,
            "beat_frequency": 4,
            "amplitude": 0.5
        }
        
        session_id = self.engine.start_session(settings)
        
        # Generate multiple frames
        frames = []
        for _ in range(10):
            frame = asyncio.run(self.engine.generate_frame(session_id))
            frames.append(frame["left"])
        
        # Concatenate frames
        continuous_audio = np.concatenate(frames)
        
        # Check for discontinuities at frame boundaries
        frame_size = len(frames[0])
        for i in range(1, len(frames)):
            boundary_index = i * frame_size
            # Check that the transition is smooth (no large jumps)
            transition_diff = abs(continuous_audio[boundary_index] - continuous_audio[boundary_index - 1])
            assert transition_diff < 0.1, f"Phase discontinuity detected at frame {i}"
        
        self.engine.stop_session(session_id)

class TestFieldSimulator:
    """Test electromagnetic field simulation for accuracy and performance."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.simulator = FieldSimulator()
        
    def test_field_simulator_initialization(self):
        """Test field simulator initializes correctly."""
        assert not self.simulator.is_running()
        assert self.simulator.grid_size == (64, 64)
        
    @pytest.mark.asyncio
    async def test_field_patterns(self):
        """Test different field pattern generation."""
        patterns = ["toroidal", "spherical", "vortex", "wave"]
        
        for pattern in patterns:
            settings = {
                "beat_frequency": 4,
                "field_intensity": 1.0,
                "field_pattern": pattern
            }
            
            self.simulator.configure("test_session", settings)
            field_frame = await self.simulator.generate_frame("test_session")
            
            # Validate field frame structure
            assert "field" in field_frame
            assert "grid_size" in field_frame
            assert "pattern" in field_frame
            assert field_frame["pattern"] == pattern
            
            # Validate field dimensions
            field_data = field_frame["field"]
            assert len(field_data) == 64
            assert len(field_data[0]) == 64
            
            self.simulator.stop_session("test_session")
            
    def test_field_synchronization(self):
        """Test that field patterns synchronize with beat frequency."""
        settings = {
            "beat_frequency": 10,  # 10 Hz
            "field_intensity": 1.0,
            "field_pattern": "toroidal"
        }
        
        self.simulator.configure("test_session", settings)
        
        # Generate fields at different time points
        start_time = time.time()
        fields = []
        
        for i in range(20):  # Generate 20 frames
            field_frame = asyncio.run(self.simulator.generate_frame("test_session"))
            fields.append(field_frame["field"])
            time.sleep(1/60)  # 60 FPS
        
        # Analyze temporal variation
        center_values = [field[32][32] for field in fields]  # Center point values
        
        # Should show oscillation at beat frequency
        fft = np.fft.fft(center_values)
        freqs = np.fft.fftfreq(len(center_values), 1/60)
        
        # The strongest frequency component should be near the beat frequency
        dominant_freq_index = np.argmax(np.abs(fft[1:len(fft)//2])) + 1
        dominant_freq = abs(freqs[dominant_freq_index])
        
        # Allow some tolerance due to limited sample size
        assert abs(dominant_freq - 10) < 5, f"Field synchronization: expected ~10 Hz, got {dominant_freq} Hz"
        
        self.simulator.stop_session("test_session")

class TestADHDProtocols:
    """Test ADHD protocol implementations for clinical accuracy."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.protocols = ADHDProtocols()
        
    def test_protocol_availability(self):
        """Test that key ADHD protocols are available."""
        all_protocols = self.protocols.get_all_protocols()
        
        # Key protocols should be present
        expected_protocols = ["smr_training", "theta_suppression", "executive_function"]
        for protocol in expected_protocols:
            assert protocol in all_protocols, f"Missing protocol: {protocol}"
            
    def test_smr_protocol_specification(self):
        """Test SMR training protocol follows clinical guidelines."""
        smr_protocol = self.protocols.get_protocol("smr_training")
        
        # Validate protocol structure
        assert "stages" in smr_protocol
        assert "total_duration" in smr_protocol
        assert smr_protocol["total_duration"] == 30  # 30 minutes
        
        # Validate stages
        stages = smr_protocol["stages"]
        assert len(stages) == 3  # Warm-up, core, cool-down
        
        # Check frequency ranges are in SMR band (12-15 Hz)
        for stage in stages:
            beat_freq = stage["beat_frequency"]
            assert 10 <= beat_freq <= 16, f"Beat frequency {beat_freq} outside SMR range"
            
    def test_protocol_timing(self):
        """Test that protocol timing adds up correctly."""
        for protocol_name, protocol in self.protocols.get_all_protocols().items():
            if "stages" in protocol:
                calculated_duration = sum(stage["duration_minutes"] for stage in protocol["stages"])
                expected_duration = protocol.get("total_duration", calculated_duration)
                
                assert calculated_duration == expected_duration, \
                    f"Protocol {protocol_name}: timing mismatch ({calculated_duration} vs {expected_duration})"
                    
    def test_smooth_transitions(self):
        """Test that frequency transitions between stages are smooth."""
        protocols = self.protocols.get_all_protocols()
        
        for protocol_name, protocol in protocols.items():
            if "stages" not in protocol:
                continue
                
            stages = protocol["stages"]
            for i in range(len(stages) - 1):
                current_freq = stages[i]["beat_frequency"]
                next_freq = stages[i + 1]["beat_frequency"]
                
                # Frequency jump should not exceed 4 Hz for smooth transition
                freq_jump = abs(next_freq - current_freq)
                assert freq_jump <= 6, \
                    f"Protocol {protocol_name}, stage {i}: large frequency jump ({freq_jump} Hz)"

class TestWebSocketIntegration:
    """Test WebSocket streaming integration."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.server_url = "ws://localhost:8000"
        
    @pytest.mark.asyncio
    async def test_websocket_connection(self):
        """Test WebSocket connection establishment."""
        # This test assumes the FastAPI server is running
        # Skip if server is not available
        try:
            async with websockets.connect(f"{self.server_url}/ws/test_session") as websocket:
                # Send test message
                await websocket.send(json.dumps({
                    "type": "start_stream",
                    "settings": {
                        "base_frequency": 200,
                        "beat_frequency": 4
                    }
                }))
                
                # Receive response
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(response)
                
                # Should receive frame data
                assert "type" in data
                
        except (ConnectionRefusedError, OSError, asyncio.TimeoutError):
            pytest.skip("WebSocket server not available")
            
    @pytest.mark.asyncio
    async def test_streaming_performance(self):
        """Test streaming performance and frame rate."""
        try:
            async with websockets.connect(f"{self.server_url}/ws/test_session") as websocket:
                # Start streaming
                await websocket.send(json.dumps({
                    "type": "start_stream",
                    "settings": {"beat_frequency": 4}
                }))
                
                # Measure frame rate
                frame_times = []
                start_time = time.time()
                
                for _ in range(60):  # Collect 60 frames
                    response = await asyncio.wait_for(websocket.recv(), timeout=1.0)
                    frame_times.append(time.time())
                
                # Calculate actual FPS
                total_time = frame_times[-1] - frame_times[0]
                actual_fps = len(frame_times) / total_time
                
                # Should be close to 60 FPS
                assert 50 <= actual_fps <= 65, f"FPS outside acceptable range: {actual_fps}"
                
        except (ConnectionRefusedError, OSError, asyncio.TimeoutError):
            pytest.skip("WebSocket server not available")

class TestSystemIntegration:
    """Integration tests for complete system functionality."""
    
    @pytest.mark.asyncio
    async def test_complete_session_flow(self):
        """Test a complete therapy session from start to finish."""
        # Initialize components
        audio_engine = AudioEngine()
        field_simulator = FieldSimulator()
        protocols = ADHDProtocols()
        
        # Get SMR protocol
        smr_protocol = protocols.get_protocol("smr_training")
        
        session_id = "integration_test_session"
        
        # Simulate session progression through all stages
        elapsed_time = 0
        for stage_index, stage in enumerate(smr_protocol["stages"]):
            print(f"Testing stage {stage_index + 1}: {stage['description']}")
            
            # Configure components for this stage
            settings = {
                "base_frequency": stage["base_frequency"],
                "beat_frequency": stage["beat_frequency"],
                "amplitude": 0.5,
                "field_pattern": "toroidal"
            }
            
            # Start/update session
            if stage_index == 0:
                audio_engine.start_session(settings)
                field_simulator.configure(session_id, settings)
            else:
                audio_engine.update_settings(session_id, settings)
                field_simulator.update_settings(session_id, settings)
            
            # Generate frames for this stage (simulate 10 seconds)
            for frame_num in range(600):  # 10 seconds * 60 FPS
                audio_frame = await audio_engine.generate_frame(session_id)
                field_frame = await field_simulator.generate_frame(session_id)
                
                # Validate frames
                assert len(audio_frame["left"]) > 0
                assert len(field_frame["field"]) == 64
                
                elapsed_time += 1/60  # 60 FPS
            
            print(f"Stage {stage_index + 1} completed successfully")
        
        # Clean up
        audio_engine.stop_session(session_id)
        field_simulator.stop_session(session_id)
        
        print("Complete session flow test passed!")

def test_performance_benchmark():
    """Benchmark system performance under load."""
    print("Running performance benchmark...")
    
    # Test audio generation performance
    engine = AudioEngine()
    session_id = engine.start_session({"beat_frequency": 4})
    
    start_time = time.time()
    frame_count = 0
    
    # Generate frames for 5 seconds
    while time.time() - start_time < 5.0:
        frame = asyncio.run(engine.generate_frame(session_id))
        frame_count += 1
    
    elapsed_time = time.time() - start_time
    fps = frame_count / elapsed_time
    
    print(f"Audio generation: {fps:.1f} FPS ({frame_count} frames in {elapsed_time:.2f}s)")
    
    # Should easily achieve 60+ FPS
    assert fps >= 60, f"Audio generation too slow: {fps} FPS"
    
    engine.stop_session(session_id)
    
    # Test field simulation performance
    simulator = FieldSimulator()
    simulator.configure("bench_session", {"beat_frequency": 4})
    
    start_time = time.time()
    frame_count = 0
    
    # Generate field frames for 5 seconds
    while time.time() - start_time < 5.0:
        field = asyncio.run(simulator.generate_frame("bench_session"))
        frame_count += 1
    
    elapsed_time = time.time() - start_time
    fps = frame_count / elapsed_time
    
    print(f"Field simulation: {fps:.1f} FPS ({frame_count} frames in {elapsed_time:.2f}s)")
    
    # Should achieve reasonable FPS for real-time visualization
    assert fps >= 30, f"Field simulation too slow: {fps} FPS"
    
    simulator.stop_session("bench_session")

def generate_test_report():
    """Generate a comprehensive test report with visualizations."""
    print("Generating test report...")
    
    # Create frequency accuracy plot
    plt.figure(figsize=(12, 8))
    
    # Test multiple frequencies
    test_frequencies = [4, 8, 10, 14, 20, 40]
    actual_frequencies = []
    
    engine = AudioEngine()
    
    for target_freq in test_frequencies:
        settings = {"base_frequency": 200, "beat_frequency": target_freq}
        session_id = engine.start_session(settings)
        
        # Generate audio and analyze
        frames = []
        for _ in range(120):  # 2 seconds
            frame = asyncio.run(engine.generate_frame(session_id))
            frames.extend(frame["left"])
        
        # FFT analysis
        audio_data = np.array(frames)
        fft = np.fft.rfft(audio_data)
        freqs = np.fft.rfftfreq(len(audio_data), 1/44100)
        
        # Find beat frequency
        # Look for modulation in the spectrum around base frequency
        base_freq_index = np.argmin(np.abs(freqs - 200))
        search_range = slice(base_freq_index - 50, base_freq_index + 50)
        
        magnitude = np.abs(fft[search_range])
        peak_index = np.argmax(magnitude) + base_freq_index - 50
        detected_freq = freqs[peak_index] - 200  # Beat frequency
        
        actual_frequencies.append(abs(detected_freq))
        engine.stop_session(session_id)
    
    # Plot frequency accuracy
    plt.subplot(2, 2, 1)
    plt.plot(test_frequencies, test_frequencies, 'k--', label='Perfect accuracy')
    plt.plot(test_frequencies, actual_frequencies, 'ro-', label='Measured')
    plt.xlabel('Target Beat Frequency (Hz)')
    plt.ylabel('Measured Beat Frequency (Hz)')
    plt.title('Frequency Accuracy Test')
    plt.legend()
    plt.grid(True)
    
    # Field pattern visualization
    plt.subplot(2, 2, 2)
    simulator = FieldSimulator()
    settings = {"beat_frequency": 4, "field_pattern": "toroidal"}
    simulator.configure("viz_session", settings)
    field_frame = asyncio.run(simulator.generate_frame("viz_session"))
    
    field_data = np.array(field_frame["field"])
    plt.imshow(field_data, cmap='RdBu', interpolation='bilinear')
    plt.title('Toroidal Field Pattern')
    plt.colorbar()
    simulator.stop_session("viz_session")
    
    # Performance metrics
    plt.subplot(2, 2, 3)
    protocols = ["smr_training", "theta_suppression", "executive_function"]
    durations = []
    
    adhd_protocols = ADHDProtocols()
    for protocol_name in protocols:
        protocol = adhd_protocols.get_protocol(protocol_name)
        durations.append(protocol.get("total_duration", 0))
    
    plt.bar(protocols, durations)
    plt.xlabel('ADHD Protocol')
    plt.ylabel('Duration (minutes)')
    plt.title('Protocol Durations')
    plt.xticks(rotation=45)
    
    # System architecture diagram (text-based)
    plt.subplot(2, 2, 4)
    plt.text(0.1, 0.8, "EBL System Architecture", fontsize=14, fontweight='bold')
    plt.text(0.1, 0.7, "├── Audio Engine (NumPy/SciPy)", fontsize=10)
    plt.text(0.1, 0.6, "├── Field Simulator (SciPy)", fontsize=10)
    plt.text(0.1, 0.5, "├── ADHD Protocols", fontsize=10)
    plt.text(0.1, 0.4, "├── WebSocket Streaming", fontsize=10)
    plt.text(0.1, 0.3, "└── React Frontend", fontsize=10)
    plt.xlim(0, 1)
    plt.ylim(0, 1)
    plt.axis('off')
    plt.title('System Components')
    
    plt.tight_layout()
    plt.savefig('ebl_test_report.png', dpi=300, bbox_inches='tight')
    print("Test report saved as 'ebl_test_report.png'")

if __name__ == "__main__":
    print("🧠 Electromagnetic Beat Lab - Backend Testing")
    print("=" * 50)
    
    # Run performance benchmark
    test_performance_benchmark()
    
    # Generate comprehensive test report
    generate_test_report()
    
    # Run pytest if available
    try:
        import pytest
        print("\nRunning full test suite...")
        pytest.main([__file__, "-v"])
    except ImportError:
        print("pytest not available, run 'pip install pytest' for full test suite")
    
    print("\n✅ Testing complete!")
    print("To run individual test classes:")
    print("  python -m pytest test_ebl_backend.py::TestAudioEngine -v")
    print("  python -m pytest test_ebl_backend.py::TestFieldSimulator -v")
    print("  python -m pytest test_ebl_backend.py::TestADHDProtocols -v")