Feature: Pattern Selection and Management
  As a user seeking specific mental states
  I want to select and apply predefined binaural beat patterns
  So that I can achieve focus, relaxation, or other desired states

  Background:
    Given I have the Electromagnetic Beat Lab application loaded
    And the pattern library is available
    And I am on the patterns tab

  Scenario: View available patterns
    When I open the pattern selector
    Then I should see a list of available patterns
    And each pattern should display its name, description, and target frequency
    And patterns should be categorized by their intended effect

  Scenario: Select a focus pattern
    Given the pattern "Focus Enhancement" is available
    When I select the "Focus Enhancement" pattern
    Then the left frequency should be set to 40 Hz
    And the right frequency should be set to 44 Hz
    And the pattern mode should be set to AUTO
    And the electromagnetic field should configure for focus enhancement

  Scenario: Apply a relaxation pattern
    Given the pattern "Deep Relaxation" is available
    When I select the "Deep Relaxation" pattern
    Then the frequencies should be set to the theta range
    And the electromagnetic field should configure for relaxation
    And the audio should start automatically if auto-start is enabled

  Scenario: Switch between pattern modes
    Given I have a pattern selected
    And the mode is currently set to "AUTO"
    When I change the mode to "MANUAL"
    Then I should be able to manually adjust frequencies
    And the pattern should not automatically change settings
    And manual controls should become enabled

  Scenario: Pattern duration and timing
    Given I select a pattern with a 30-minute duration
    When I start the pattern
    Then the pattern should run for exactly 30 minutes
    And there should be a progress indicator
    And the pattern should fade out at the end

  Scenario: Pattern fade-in and fade-out
    Given I select a pattern with fade-in settings
    When I start the pattern
    Then the audio should gradually increase from silence
    And the electromagnetic field should gradually strengthen
    And the transition should be smooth over the specified duration

  Scenario: Custom pattern creation
    Given I am in manual mode
    When I create a custom frequency combination
    And I save it as a new pattern named "My Custom Pattern"
    Then the pattern should be added to my personal library
    And I should be able to select it later
    And it should remember all the configured settings

  Scenario: Pattern categories and filtering
    Given multiple patterns are available
    When I filter by "Sleep" category
    Then only sleep-related patterns should be visible
    And they should all have delta frequency ranges
    And inappropriate patterns should be hidden

  Scenario Outline: Pattern frequency validation
    Given I have pattern "<pattern_name>" available
    When I select the pattern "<pattern_name>"
    Then the beat frequency should be in the "<frequency_range>" range
    And the electromagnetic field should be optimized for "<target_state>"

    Examples:
      | pattern_name      | frequency_range | target_state |
      | Deep Sleep        | 0.5-4 Hz       | sleep        |
      | Meditation        | 4-8 Hz         | meditation   |
      | Calm Focus        | 8-13 Hz        | relaxed_focus|
      | Active Focus      | 13-30 Hz       | active_focus |
      | Creative Flow     | 30-100 Hz      | creativity   |

  Scenario: Pattern synchronization with backend
    Given I select a pattern that requires backend processing
    When the pattern is applied
    Then the frontend should communicate with the backend API
    And the backend should generate appropriate audio streams
    And the WebSocket connection should deliver real-time data
    And the pattern should sync perfectly between frontend and backend

  Scenario: Handle pattern loading errors
    Given I attempt to load a corrupted pattern
    When the pattern fails to load
    Then an appropriate error message should be displayed
    And the system should fall back to a default pattern
    And the application should remain stable and usable

  Scenario: Pattern persistence across sessions
    Given I have selected and customized a pattern
    When I close and reopen the application
    Then my pattern preferences should be remembered
    And the last used pattern should be pre-selected
    And all customizations should be preserved