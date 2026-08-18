package utils

import (
	"encoding/json"

	model "tbs-sdk-go-v2.0.x-server/internal/dtos"
)

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

func MapAddDBARequest(request model.AddDBARequest) map[string]any {
	payload := make(map[string]any)
	data, err := json.Marshal(request)
	if err != nil {
		return payload
	}

	_ = json.Unmarshal(data, &payload)
	return payload
}

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

func MapJSON(request any) map[string]any {
	payload := make(map[string]any)
	data, err := json.Marshal(request)
	if err != nil {
		return payload
	}

	_ = json.Unmarshal(data, &payload)
	return payload
}
