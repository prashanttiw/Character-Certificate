import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

const PasswordInput = ({ value, onChange, placeholder, name }) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div
        className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
        onClick={() => setShowPassword(prev => !prev)}
      >
        {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
      </div>
    </div>
  )
}

export default PasswordInput
