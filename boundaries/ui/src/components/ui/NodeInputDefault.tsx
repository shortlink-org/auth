'use client'

import { useState } from 'react'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

import { NodeInputProps } from './helpers'

export function NodeInputDefault(props: NodeInputProps) {
  const { node, attributes, value = '', setValue, disabled } = props
  const [showPassword, setShowPassword] = useState(false)

  // Some attributes have dynamic JavaScript - this is for example required for WebAuthn.
  const onClick = () => {
    // This section is only used for WebAuthn.
    // The script is loaded via a <script> node,
    // and the functions are available on the global window level.
    // Unfortunately, there
    // is currently no better way than executing eval / function here at this moment.
    if (attributes.onclick) {
      const run = new Function(attributes.onclick)
      run()
    }
  }

  const errorMessage = node.messages.find(({ type }) => type === 'error')
  const isPasswordField = attributes.type === 'password'

  // Determine the actual input type
  const inputType = isPasswordField && showPassword ? 'text' : attributes.type

  // Render a generic text input field.
  return (
    <TextField
      name={attributes.name}
      id={node.meta.label?.text}
      type={inputType}
      required={attributes.required}
      fullWidth
      margin="normal"
      label={node.meta.label?.text}
      value={value}
      disabled={attributes.disabled || disabled}
      error={!!errorMessage}
      helperText={errorMessage?.text}
      onClick={onClick}
      onChange={(e) => {
        setValue(e.target.value)
      }}
      slotProps={{
        input: {
          className: 'transition-all duration-200',
          endAdornment: isPasswordField ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                size="small"
                className="transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '0.5rem',
          transition: 'all 0.2s',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--primary)',
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
          },
        },
        '& .MuiInputLabel-root': {
          '&.Mui-focused': {
            color: 'var(--primary)',
          },
        },
      }}
    />
  )
}
