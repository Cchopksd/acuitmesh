package helpers

type Role string

const (
	Owner  Role = "owner"
	Collaborator Role = "collaborator"
	Viewer Role = "viewer"
)

// Permission กำหนดสิทธิ์ที่สามารถทำได้
type Permission string

const (
	CanCreate Permission = "can_create"
	CanEdit   Permission = "can_edit"
	CanView   Permission = "can_view"
	CanDelete Permission = "can_delete"
)

// RolePermissions กำหนดสิทธิ์ตาม Role
var RolePermissions = map[Role][]Permission{
	Owner:  {CanCreate, CanEdit, CanView, CanDelete},
	Collaborator: {CanCreate, CanEdit, CanView},
	Viewer: {CanView},
}

func HasPermission(role Role, permission Permission) bool {
	perms, exists := RolePermissions[role]
	if !exists {
		return false
	}
	for _, p := range perms {
		if p == permission {
			return true
		}
	}
	return false
}
