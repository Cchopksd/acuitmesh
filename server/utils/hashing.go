package utils

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a password using bcrypt and returns the hashed password as a string.
func HashPassword(password string) (string, error) {
	// bcrypt cost factor (12 is a good default, higher means more computationally expensive)
	const cost = 12

	// Generate the bcrypt hash of the password.
	hash, err := bcrypt.GenerateFromPassword([]byte(password), cost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}

	// Return the hashed password as a string.
	return string(hash), nil
}

// VerifyPassword verifies if the entered password matches the hashed password.
func VerifyPassword(passwordHashed, password string) bool {
	// Compare the entered password with the stored hash using bcrypt's CompareHashAndPassword
	err := bcrypt.CompareHashAndPassword([]byte(passwordHashed), []byte(password))
	if err != nil {
		log.Printf("Password mismatch: %v", err)
		return false
	}

	// If no error, the password matches
	return true
}
