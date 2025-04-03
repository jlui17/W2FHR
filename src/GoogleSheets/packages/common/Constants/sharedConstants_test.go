package SharedConstants

import "testing"

func TestNormalizeString(t *testing.T) {
	raw := "Thursday, January 02, 2025"
	expected := "Thursday, January 02, 2025"

	normalized := normalizeString(raw)

	if normalized != expected {
		t.Errorf("normalizeString failed, expected %s, got %s", expected, normalized)
	}
}
