package repositories

import (
	"errors"
	"server/models"

	"github.com/jinzhu/gorm"
)

type UserRepository interface {
	Create(user *models.User) error
	FindAll() ([]models.User, error)
	FindByEmail(email string) (*models.User, error)
	GetUserByID(id uint) (*models.User, error)
}

type UserRepositoryImpl struct {
	DB *gorm.DB
}

func NewUserRepository(DB *gorm.DB) *UserRepositoryImpl {
	return &UserRepositoryImpl{DB: DB}
}

func (repo *UserRepositoryImpl) Create(user *models.User) error {
	return repo.DB.Create(user).Error
}

func (repo *UserRepositoryImpl) FindAll() ([]models.User, error) {
	var users []models.User
	if err := repo.DB.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (repo *UserRepositoryImpl) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := repo.DB.Where("email = ?", email).First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil  
		}
		return nil, err
	}

	return &user, nil
}

func (repo *UserRepositoryImpl) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	if err := repo.DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
