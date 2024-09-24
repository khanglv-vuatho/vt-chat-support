import { FieldError, UseFormRegister, RegisterOptions, useFormContext, Controller, useForm } from 'react-hook-form'

interface CustomInputProps {
  placeholder: string
  type: string
  register: UseFormRegister<any>
  name: string
  rules: RegisterOptions
  error?: FieldError
}

const CustomInput: React.FC<CustomInputProps> = ({ placeholder, type, register, name, rules, error }) => {
  return (
    <>
      <input placeholder={placeholder} type={type} {...register(name, rules)} />
      {error && <p>{error.message}</p>}
    </>
  )
}
interface SwitchCustomProps {
  name: string
  error?: FieldError
  isDisabled?: boolean
}

const SwitchCustom: React.FC<SwitchCustomProps> = ({ name, error, isDisabled = false }) => {
  const { control } = useForm() // Use form context to get the control object

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <>
          <button
            disabled={isDisabled}
            type='button'
            onClick={() => field.onChange(!field.value)}
            className={`${field.value ? 'bg-green-50' : 'bg-gray-50'} ${isDisabled ? 'grayscale-[45%]' : ''} relative flex w-14 rounded-full p-1 shadow-inner duration-300`}
          >
            <div className={`${field.value ? 'translate-x-[100%] bg-green-500 shadow-[0_0_20px_1px_#84cc16]' : 'bg-gray-300 shadow-[0_0_20px_1px_#d1d5db]'} size-6 rounded-full transition`} />
          </button>
          {error && <p>{error.message}</p>}
        </>
      )}
    />
  )
}
export { CustomInput, SwitchCustom }
