export type GroupField = {
  id:         string
  fieldName:  string
  fieldType:  string
  isRequired: boolean
  options:    string[]
  createdAt:  string
  updatedAt:  string
}

export type Group = {
  id:          string
  groupName:   string
  description: string
  fields:      GroupField[]
  createdAt:   string
  updatedAt:   string
}
