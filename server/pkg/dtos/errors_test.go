package dtos

import "testing"

func TestCriticalAPIErrorMessage(t *testing.T) {
	err := &CriticalAPIError{Status: 502, Message: "upstream failure"}
	if err.Error() != "upstream failure" {
		t.Errorf("Error() = %q, want %q", err.Error(), "upstream failure")
	}
}

func TestPayloadErrorMessageIsStable(t *testing.T) {
	err := &PayloadError{Payload: map[string]any{"Message": "invalid input"}}
	if err.Error() != "request failed" {
		t.Errorf("Error() = %q, want %q", err.Error(), "request failed")
	}
}
