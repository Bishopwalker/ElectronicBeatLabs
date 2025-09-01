Feature: Electromagnetic Field Visualization
  As a user interested in the electromagnetic aspects of binaural beats
  I want to visualize the electromagnetic field in real-time
  So that I can understand and monitor the field interactions

  Background:
    Given I have the Electromagnetic Beat Lab application loaded
    And the visualization system is initialized
    And I am viewing the main interface

  Scenario: Basic electromagnetic field display
    Given the electromagnetic field simulation is running
    When I start audio generation
    Then I should see a visual representation of the electromagnetic field
    And the field should display strength, frequency, and coherence values
    And the visualization should update in real-time

  Scenario: Field strength visualization
    Given the audio is playing with a 10 Hz beat frequency
    When the electromagnetic field is active
    Then the field strength indicator should show a value greater than 0
    And the strength should correlate with the audio amplitude
    And the visualization should use appropriate color coding

  Scenario: Coherence and resonance display
    Given the electromagnetic field is active
    And the beat frequency is stable
    When the field reaches resonance
    Then the coherence meter should show high values
    And the resonance indicator should display optimal state
    And the visual feedback should reflect the stable field state

  Scenario: Field phase relationships
    Given two oscillating frequencies are generating beats
    When I observe the electromagnetic field visualization
    Then I should see the phase relationships between field components
    And the phase differences should match the beat frequency
    And the visualization should show constructive and destructive interference

  Scenario: Spatial field distribution
    Given the spatial visualizer is active
    When the electromagnetic field is generated
    Then I should see the 3D spatial distribution of the field
    And the field should show proper gradients and fall-off patterns
    And hotspots should be visible in areas of high field intensity

  Scenario: Real-time field updates
    Given the electromagnetic field is being visualized
    When I change the beat frequency from 4 Hz to 10 Hz
    Then the field visualization should update immediately
    And the field frequency should change to match the new beat frequency
    And all field parameters should smoothly transition to new values

  Scenario: Field stability monitoring
    Given the electromagnetic field has been running for several minutes
    When I monitor the field stability
    Then the stability indicator should show consistent values
    And fluctuations should be within acceptable ranges
    And any instabilities should be clearly visible

  Scenario: Multi-layered field visualization
    Given complex patterns are generating multiple beat frequencies
    When the electromagnetic field shows multiple components
    Then I should see layered visualizations for each frequency component
    And each layer should be distinguishable by color or pattern
    And the combined field should show interference patterns

  Scenario Outline: Field visualization for different frequency ranges
    Given I set frequencies to generate a <beat_frequency> Hz beat
    When the electromagnetic field visualization is active
    Then the field should display characteristics appropriate for <frequency_range>
    And the visualization style should match <expected_appearance>

    Examples:
      | beat_frequency | frequency_range | expected_appearance |
      | 2              | Delta          | slow_pulsing        |
      | 6              | Theta          | gentle_waves        |
      | 10             | Alpha          | rhythmic_patterns   |
      | 20             | Beta           | active_oscillations |
      | 40             | Gamma          | rapid_fluctuations  |

  Scenario: Field interaction with 8D audio effects
    Given 8D audio spatial effects are enabled
    And the electromagnetic field is active
    When spatial audio moves around the listener
    Then the electromagnetic field should show corresponding spatial changes
    And the field should rotate and move with the audio positioning
    And the 3D visualization should reflect the spatial audio movement

  Scenario: Export field visualization data
    Given the electromagnetic field has been running and recorded
    When I request to export the field data
    Then I should be able to save field strength over time
    And frequency analysis data should be exportable
    And the export should include timestamps and metadata

  Scenario: Field visualization performance
    Given the electromagnetic field visualization is running
    When the system is under load with complex patterns
    Then the visualization should maintain smooth frame rates
    And the field calculations should not impact audio quality
    And the interface should remain responsive

  Scenario: Customize visualization settings
    Given I access the visualization settings
    When I modify the color scheme, transparency, and display options
    Then the electromagnetic field should update with my preferences
    And the settings should be saved for future sessions
    And I should be able to reset to default visualization settings