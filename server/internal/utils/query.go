package utils

import (
	"net/url"
	"strconv"
	"strings"
)

func GetCaseInsensitive(values url.Values, key string) string {
	if value := values.Get(key); value != "" {
		return value
	}

	for currentKey, currentValues := range values {
		if strings.EqualFold(currentKey, key) && len(currentValues) > 0 {
			return currentValues[0]
		}
	}

	return ""
}

func GetIntCaseInsensitive(values url.Values, key string, fallback int) int {
	value := GetCaseInsensitive(values, key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}

func GetBoolPointerCaseInsensitive(values url.Values, key string) *bool {
	value := GetCaseInsensitive(values, key)
	if value == "" {
		return nil
	}

	lowered := strings.ToLower(value)
	if lowered == "true" {
		result := true
		return &result
	}
	if lowered == "false" {
		result := false
		return &result
	}

	return nil
}
