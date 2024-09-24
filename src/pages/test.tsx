import { CustomInput, SwitchCustom } from '@/components/InputCustom'
import { useForm, SubmitHandler, UseFormRegister } from 'react-hook-form'

type TDataForm = {
  firstName: string
  lastName: string
  switch: boolean
}

export default function Test() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<TDataForm>()

  const onSubmit: SubmitHandler<TDataForm> = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CustomInput
        placeholder='First name'
        type='text'
        register={register}
        name='firstName'
        rules={{
          required: 'required',
          minLength: {
            value: 3,
            message: 'Min length is 3'
          }
        }}
        error={errors.firstName}
      />
      <CustomInput
        placeholder='Last name'
        type='text'
        register={register}
        name='lastName'
        rules={{
          required: 'required',
          minLength: {
            value: 3,
            message: 'Min length is 3'
          }
        }}
        error={errors.lastName}
      />
      <SwitchCustom name='switch' error={errors.switch} />
      <button type='submit'>Submit</button>
    </form>
  )
}
