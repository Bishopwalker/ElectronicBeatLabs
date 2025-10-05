#!/usr/bin/env python3
"""
Test script to demonstrate the timer math bug.
"""

# Mock the timer calculation logic
def calculate_time_remaining_wrong(current_transition_index, elapsed_minutes, transitions):
    """Current (buggy) implementation"""
    # Current transition remaining time
    if current_transition_index < len(transitions):
        current_transition = transitions[current_transition_index]
        time_remaining_current = current_transition['duration_minutes'] - elapsed_minutes
    else:
        time_remaining_current = 0
    
    # Total time remaining (this is the bug)
    time_remaining_total = time_remaining_current
    for i in range(current_transition_index + 1, len(transitions)):
        time_remaining_total += transitions[i]['duration_minutes']
    
    return time_remaining_current, time_remaining_total

def calculate_time_remaining_correct(current_transition_index, elapsed_minutes, transitions):
    """Fixed implementation"""
    # Current transition remaining time
    if current_transition_index < len(transitions):
        current_transition = transitions[current_transition_index]
        time_remaining_current = current_transition['duration_minutes'] - elapsed_minutes
    else:
        time_remaining_current = 0
    
    # Total time remaining (fixed)
    time_remaining_total = time_remaining_current
    for i in range(current_transition_index + 1, len(transitions)):
        time_remaining_total += transitions[i]['duration_minutes']
    
    return time_remaining_current, time_remaining_total

# Test case: 4 transitions of 10 minutes each
transitions = [
    {'duration_minutes': 10},  # Transition 0: 10 min
    {'duration_minutes': 15},  # Transition 1: 15 min
    {'duration_minutes': 20},  # Transition 2: 20 min
    {'duration_minutes': 5},   # Transition 3: 5 min
]
total_preset_time = sum(t['duration_minutes'] for t in transitions)  # 50 minutes

print("=== TIMER MATH TEST ===")
print(f"Transitions: {[t['duration_minutes'] for t in transitions]} minutes")
print(f"Total preset duration: {total_preset_time} minutes")
print()

# Test scenarios
test_cases = [
    (0, 0, "Start of first transition"),
    (0, 5, "Middle of first transition (5 min elapsed)"),
    (0, 10, "End of first transition (should move to next)"),
    (1, 0, "Start of second transition"),
    (1, 7, "Middle of second transition (7 min elapsed)"),
    (2, 0, "Start of third transition"),
    (3, 0, "Start of final transition"),
    (3, 3, "Middle of final transition (3 min elapsed)"),
]

for current_idx, elapsed, description in test_cases:
    current_wrong, total_wrong = calculate_time_remaining_wrong(current_idx, elapsed, transitions)
    current_correct, total_correct = calculate_time_remaining_correct(current_idx, elapsed, transitions)
    
    print(f"{description}:")
    print(f"  Current index: {current_idx}, Elapsed: {elapsed} min")
    print(f"  Current remaining: {current_wrong} min")
    print(f"  Total remaining (current impl): {total_wrong} min")
    print(f"  Total remaining (fixed impl): {total_correct} min")
    
    if total_wrong != total_correct:
        print(f"  [BUG] DETECTED: Difference of {total_wrong - total_correct} minutes")
    else:
        print(f"  [OK] Logic is correct")
    print()