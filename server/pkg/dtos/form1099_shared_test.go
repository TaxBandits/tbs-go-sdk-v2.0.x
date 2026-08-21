package dtos

import (
	"encoding/json"
	"testing"
)

// TestDistributionDetailsMarshalsTypedConstantsAsPlainStrings pins the JSON wire format: the typed
// DistributionType/PostalType fields must still serialize as bare strings, matching the API contract
// that existed when these fields were *string.
func TestDistributionDetailsMarshalsTypedConstantsAsPlainStrings(t *testing.T) {
	distributionType := DistributionTypeOnlineAccess
	postalType := PostalTypeUSPSFirstClass

	details := DistributionDetails{
		DistributionType: &distributionType,
		PostalType:       &postalType,
	}

	got, err := json.Marshal(details)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	want := `{"DistributionType":"ONLINE_ACCESS","PostalType":"USPS_FIRST_CLASS"}`
	if string(got) != want {
		t.Errorf("Marshal() = %s, want %s", got, want)
	}
}

// TestDistributionDetailsUnmarshalsIntoTypedConstants checks the reverse direction: a response body
// using one of the supported values must decode into the matching typed constant.
func TestDistributionDetailsUnmarshalsIntoTypedConstants(t *testing.T) {
	tests := []struct {
		name string
		body string
		want DistributionDetails
	}{
		{
			name: "postal only",
			body: `{"DistributionType":"POSTAL_ONLY","PostalType":"USPS_FIRST_CLASS"}`,
			want: DistributionDetails{
				DistributionType: distTypePtr(DistributionTypePostalOnly),
				PostalType:       postalTypePtr(PostalTypeUSPSFirstClass),
			},
		},
		{
			name: "online access",
			body: `{"DistributionType":"ONLINE_ACCESS"}`,
			want: DistributionDetails{
				DistributionType: distTypePtr(DistributionTypeOnlineAccess),
			},
		},
		{
			name: "postal and online",
			body: `{"DistributionType":"POSTAL_AND_ONLINE"}`,
			want: DistributionDetails{
				DistributionType: distTypePtr(DistributionTypePostalAndOnline),
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			var got DistributionDetails
			if err := json.Unmarshal([]byte(tc.body), &got); err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if (got.DistributionType == nil) != (tc.want.DistributionType == nil) {
				t.Fatalf("DistributionType = %v, want %v", got.DistributionType, tc.want.DistributionType)
			}
			if got.DistributionType != nil && *got.DistributionType != *tc.want.DistributionType {
				t.Errorf("DistributionType = %q, want %q", *got.DistributionType, *tc.want.DistributionType)
			}
			if (got.PostalType == nil) != (tc.want.PostalType == nil) {
				t.Fatalf("PostalType = %v, want %v", got.PostalType, tc.want.PostalType)
			}
			if got.PostalType != nil && *got.PostalType != *tc.want.PostalType {
				t.Errorf("PostalType = %q, want %q", *got.PostalType, *tc.want.PostalType)
			}
		})
	}
}

func distTypePtr(d DistributionType) *DistributionType { return &d }
func postalTypePtr(p PostalType) *PostalType           { return &p }
