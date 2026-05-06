import React, { useState } from 'react'

interface FormField {
  name: string
  label: string
  type?: 'text' | 'number' | 'select' | 'textarea' | 'date'
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface FormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, string | number>) => void
  submitLabel?: string
  initialData?: Record<string, string | number>
}

export function Form({ fields, onSubmit, submitLabel = '提交', initialData = {} }: FormProps) {
  const [formData, setFormData] = useState<Record<string, string | number>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    for (const field of fields) {
      const value = formData[field.name]

      if (field.required && (!value || String(value).trim() === '')) {
        newErrors[field.name] = `${field.label} 為必填欄位`
      }

      if (field.type === 'number' && value && isNaN(Number(value))) {
        newErrors[field.name] = `${field.label} 必須為數字`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    onSubmit(formData)
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] || ''

    switch (field.type) {
      case 'select':
        return (
          <select
            key={field.name}
            value={String(value)}
            onChange={(e) => handleChange(field.name, e.target.value)}
          >
            <option value="">請選擇</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )

      case 'textarea':
        return (
          <textarea
            key={field.name}
            value={String(value)}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
          />
        )

      case 'date':
        return (
          <input
            key={field.name}
            type="date"
            value={String(value)}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        )

      default:
        return (
          <input
            key={field.name}
            type={field.type || 'text'}
            value={String(value)}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {fields.map(field => (
        <div key={field.name} className="form-field">
          <label>{field.label}</label>
          {renderField(field)}
          {errors[field.name] && (
            <span className="field-error">{errors[field.name]}</span>
          )}
        </div>
      ))}

      <button type="submit" className="btn btn-primary">
        {submitLabel}
      </button>
    </form>
  )
}
