import { InputCustom } from '@/components/InputCustom'
import { Button } from '@nextui-org/react'
import React from 'react'
import { useForm, SubmitHandler, FieldError } from 'react-hook-form'

// Define form inputs type
interface FormInputs {
  username: string
  email: string
}

const TestPage: React.FC = () => {
  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<FormInputs>({
    defaultValues: {
      username: '',
      email: ''
    }
  })

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    console.log('123 ')
    console.log('Form Data:', data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Component1 />
      <InputCustom placeholder='username' name='username' control={control} rules={{ required: 'Username is required' }} error={errors.username as FieldError} />
      <InputCustom
        name='email'
        placeholder='email'
        control={control}
        error={errors.email as FieldError}
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: 'Invalid email address'
          }
        }}
      />

      <Button type='submit'>Submit</Button>
    </form>
  )
}
const Component1 = () => {
  console.log('Component1')
  return <div>Component 1</div>
}

export default TestPage
