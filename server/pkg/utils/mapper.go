package utils

import (
	"encoding/json"

	model "github.com/TaxBandits/tbs-go-sdk-v2.0.x/server/pkg/dtos"
)

// MapBusinessRequest converts a BusinessesRequest into the JSON payload
// shape the TaxBandits API expects, ensuring "Businesses" is always
// present (as an empty array if nil).
func MapBusinessRequest(request model.BusinessesRequest) map[string]any {
	if request.Businesses == nil {
		return map[string]any{"Businesses": []any{}}
	}

	payload := make(map[string]any)
	data, err := json.Marshal(request)
	if err != nil {
		return map[string]any{"Businesses": []any{}}
	}

	if err := json.Unmarshal(data, &payload); err != nil {
		return map[string]any{"Businesses": []any{}}
	}

	if _, ok := payload["Businesses"]; !ok {
		payload["Businesses"] = []any{}
	}

	return payload
}

// MapAddDBARequest converts an AddDBARequest into a generic JSON payload
// map for the TaxBandits API.
func MapAddDBARequest(request model.AddDBARequest) map[string]any {
	payload := make(map[string]any)
	data, err := json.Marshal(request)
	if err != nil {
		return payload
	}

	_ = json.Unmarshal(data, &payload)
	return payload
}

// MapRecipientsRequest converts a RecipientsRequest into the JSON payload
// shape the TaxBandits API expects, ensuring "Recipients" is always
// present (as an empty array if nil).
func MapRecipientsRequest(request model.RecipientsRequest) map[string]any {
	if request.Recipients == nil {
		return map[string]any{"Recipients": []any{}}
	}

	payload := make(map[string]any)
	data, err := json.Marshal(request)
	if err != nil {
		return map[string]any{"Recipients": []any{}}
	}

	if err := json.Unmarshal(data, &payload); err != nil {
		return map[string]any{"Recipients": []any{}}
	}

	if _, ok := payload["Recipients"]; !ok {
		payload["Recipients"] = []any{}
	}

	return payload
}

// MapJSON round-trips request through JSON marshal/unmarshal to produce
// a generic map payload, for requests with no field defaulting needs.
func MapJSON(request any) map[string]any {
	payload := make(map[string]any)
	data, err := json.Marshal(request)
	if err != nil {
		return payload
	}

	_ = json.Unmarshal(data, &payload)
	return payload
}
