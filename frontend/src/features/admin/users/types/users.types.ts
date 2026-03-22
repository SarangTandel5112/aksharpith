export type User = {
  id:        string
  firstName: string
  lastName:  string
  email:     string
  role:      { id: string; roleName: string }
  createdAt: string
  updatedAt: string
}
