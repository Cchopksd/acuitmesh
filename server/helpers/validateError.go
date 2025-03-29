package helpers

import (
	"github.com/go-playground/validator/v10"
)

func FormatValidationError(err error) map[string]string {
	if vErrs, ok := err.(validator.ValidationErrors); ok {
		validationErrors := make(map[string]string)
		for _, vErr := range vErrs {
			validationErrors[vErr.Field()] = formatErrorMessage(vErr)
		}
		return validationErrors
	}

	return map[string]string{"error": err.Error()}
}

func formatErrorMessage(vErr validator.FieldError) string {
	fieldName := vErr.Field()
	validationTag := vErr.Tag()

	switch validationTag {
	case "required":
		return fieldName + " is required"
	case "min":
		return fieldName + " must have at least " + vErr.Param() + " characters"
	case "max":
		return fieldName + " must have at most " + vErr.Param() + " characters"
	case "email":
		return fieldName + " must be a valid email address"
	case "len":
		return fieldName + " must be exactly " + vErr.Param() + " characters long"
	default:
		return fieldName + " is invalid"
	}
}
