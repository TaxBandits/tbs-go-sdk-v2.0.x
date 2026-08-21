package utils

import (
	"net/url"
	"testing"
)

func TestGetCaseInsensitive(t *testing.T) {
	values := url.Values{"pageSize": {"25"}}

	if got := GetCaseInsensitive(values, "PageSize"); got != "25" {
		t.Errorf("GetCaseInsensitive(PageSize) = %q, want %q", got, "25")
	}
	if got := GetCaseInsensitive(values, "pageSize"); got != "25" {
		t.Errorf("GetCaseInsensitive(pageSize) = %q, want %q", got, "25")
	}
	if got := GetCaseInsensitive(values, "Missing"); got != "" {
		t.Errorf("GetCaseInsensitive(Missing) = %q, want empty", got)
	}
}

func TestGetIntCaseInsensitive(t *testing.T) {
	values := url.Values{"Page": {"3"}, "Invalid": {"not-a-number"}}

	if got := GetIntCaseInsensitive(values, "Page", 1); got != 3 {
		t.Errorf("GetIntCaseInsensitive(Page) = %d, want 3", got)
	}
	if got := GetIntCaseInsensitive(values, "Missing", 7); got != 7 {
		t.Errorf("GetIntCaseInsensitive(Missing) = %d, want fallback 7", got)
	}
	if got := GetIntCaseInsensitive(values, "Invalid", 9); got != 9 {
		t.Errorf("GetIntCaseInsensitive(Invalid) = %d, want fallback 9", got)
	}
}

func TestGetBoolPointerCaseInsensitive(t *testing.T) {
	values := url.Values{"IsActive": {"true"}, "IsForced": {"FALSE"}, "Garbage": {"maybe"}}

	if got := GetBoolPointerCaseInsensitive(values, "IsActive"); got == nil || !*got {
		t.Errorf("IsActive = %v, want true", got)
	}
	if got := GetBoolPointerCaseInsensitive(values, "IsForced"); got == nil || *got {
		t.Errorf("IsForced = %v, want false", got)
	}
	if got := GetBoolPointerCaseInsensitive(values, "Garbage"); got != nil {
		t.Errorf("Garbage = %v, want nil for an unrecognized value", got)
	}
	if got := GetBoolPointerCaseInsensitive(values, "Missing"); got != nil {
		t.Errorf("Missing = %v, want nil", got)
	}
}
