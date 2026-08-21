package utils

import (
	"testing"

	model "github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
)

func TestMapBusinessRequestDefaultsToEmptyArray(t *testing.T) {
	got := MapBusinessRequest(model.BusinessesRequest{})

	businesses, ok := got["Businesses"].([]any)
	if !ok || len(businesses) != 0 {
		t.Fatalf("Businesses = %#v, want an empty array", got["Businesses"])
	}
}

func TestMapBusinessRequestPreservesProvidedBusinesses(t *testing.T) {
	ref := "PAYER-1"
	got := MapBusinessRequest(model.BusinessesRequest{Businesses: []model.Business{{PayerRef: &ref}}})

	businesses, ok := got["Businesses"].([]any)
	if !ok || len(businesses) != 1 {
		t.Fatalf("Businesses = %#v, want one entry", got["Businesses"])
	}
	entry, ok := businesses[0].(map[string]any)
	if !ok || entry["PayerRef"] != ref {
		t.Errorf("Businesses[0] = %#v, want PayerRef %q", businesses[0], ref)
	}
}

func TestMapAddDBARequestRoundTrips(t *testing.T) {
	businessID := "B-1"
	got := MapAddDBARequest(model.AddDBARequest{BusinessID: &businessID})

	if got["BusinessId"] != businessID {
		t.Errorf("BusinessId = %#v, want %q", got["BusinessId"], businessID)
	}
}

func TestMapRecipientsRequestDefaultsToEmptyArray(t *testing.T) {
	got := MapRecipientsRequest(model.RecipientsRequest{})

	recipients, ok := got["Recipients"].([]any)
	if !ok || len(recipients) != 0 {
		t.Fatalf("Recipients = %#v, want an empty array", got["Recipients"])
	}
}

func TestMapRecipientsRequestPreservesProvidedRecipients(t *testing.T) {
	ref := "PAYEE-1"
	got := MapRecipientsRequest(model.RecipientsRequest{Recipients: []model.Recipient{{PayeeRef: &ref}}})

	recipients, ok := got["Recipients"].([]any)
	if !ok || len(recipients) != 1 {
		t.Fatalf("Recipients = %#v, want one entry", got["Recipients"])
	}
	entry, ok := recipients[0].(map[string]any)
	if !ok || entry["PayeeRef"] != ref {
		t.Errorf("Recipients[0] = %#v, want PayeeRef %q", recipients[0], ref)
	}
}

func TestMapJSONRoundTripsArbitraryRequests(t *testing.T) {
	submissionID := "S-1"
	got := MapJSON(model.TransmitRequest{SubmissionId: &submissionID, RecordIds: []string{"R-1", "R-2"}})

	if got["SubmissionId"] != submissionID {
		t.Errorf("SubmissionId = %#v, want %q", got["SubmissionId"], submissionID)
	}
	recordIDs, ok := got["RecordIds"].([]any)
	if !ok || len(recordIDs) != 2 {
		t.Fatalf("RecordIds = %#v, want two entries", got["RecordIds"])
	}
}

func TestMapJSONReturnsEmptyMapForUnmarshalableInput(t *testing.T) {
	got := MapJSON(make(chan int))

	if len(got) != 0 {
		t.Errorf("MapJSON(unmarshalable) = %#v, want an empty map", got)
	}
}
