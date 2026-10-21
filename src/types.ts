export type FieldType = 'text' | 'email' | 'number' | 'select' | 'textarea' | 'radio' | 'checkbox'

export interface FieldOption { label: string; value: string }

export interface FormField {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required: boolean
  options?: FieldOption[]
  validation?: string  // simple regex string
}

export interface BranchCondition {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_empty'
  value: string
}

export interface FormStep {
  id: string
  title: string
  fields: FormField[]
  // Branching: which step to go to based on condition
  branches: Array<{
    condition: BranchCondition
    targetStepId: string
  }>
  defaultNextStepId: string | null  // null = end of form
}
