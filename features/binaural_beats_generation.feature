Feature: Binaural Beats Generation
  As a user of the Electromagnetic Beat Lab
  I want to generate binaural beats with precise frequencies
  So that I can experience targeted brainwave entrainment

  Background:
    Given I have the Electromagnetic Beat Lab application loaded
    And the audio system is initialized

  Scenario: Generate basic binaural beats
    Given I set the left frequency to 440 Hz
    And I set the right frequency to 444 Hz
    When I start the audio generation
    Then I should hear binaural beats with a 4 Hz beat frequency
    And the electromagnetic field should be active
    And the field strength should be greater than 0

  Scenario: Adjust frequency during playback
    Given the audio is currently playing
    And the left frequency is 440 Hz
    And the right frequency is 444 Hz
    When I change the left frequency to 528 Hz
    Then the beat frequency should update to 12 Hz
    And the electromagnetic field should adjust accordingly
    And there should be no audio interruption

  Scenario: Volume control affects both channels
    Given the audio is currently playing
    And the volume is set to 50%
    When I adjust the volume to 80%
    Then both left and right channels should increase in amplitude
    And the beat frequency should remain unchanged
    And the electromagnetic field strength should scale proportionally

  Scenario: Different waveforms produce distinct characteristics
    Given the audio is currently playing with sine waves
    When I switch the waveform to "square"
    Then the audio should change to square wave generation
    And the electromagnetic field pattern should update
    And the harmonic content should be visibly different

  Scenario: Stop audio generation cleanly
    Given the audio is currently playing
    And the electromagnetic field is active
    When I stop the audio generation
    Then all audio output should cease immediately
    And the electromagnetic field should become inactive
    And all audio resources should be properly released

  Scenario Outline: Generate beats in different brainwave ranges
    Given I set the left frequency to <left_freq> Hz
    And I set the right frequency to <right_freq> Hz
    When I start the audio generation
    Then I should hear beats in the <brainwave_range> range
    And the electromagnetic field should show <expected_state> characteristics

    Examples:
      | left_freq | right_freq | brainwave_range | expected_state |
      | 440       | 442        | Delta           | deep_resonance |
      | 440       | 446        | Theta           | medium_resonance |
      | 440       | 450        | Alpha           | balanced_resonance |
      | 440       | 460        | Beta            | active_resonance |
      | 440       | 480        | Gamma           | high_resonance |

  Scenario: Handle extreme frequency values
    Given I attempt to set invalid frequencies
    When I set the left frequency to -100 Hz
    Then the system should reject the invalid value
    And the frequency should remain at the previous valid value
    And an appropriate error message should be displayed

  Scenario: Maintain synchronization between channels
    Given the audio is currently playing
    And both channels are synchronized
    When I rapidly change frequencies multiple times
    Then both channels should remain perfectly synchronized
    And the beat frequency should update smoothly
    And there should be no phase drift between channels