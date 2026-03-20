import { Flex, Box, Text, TextField, Button, Separator } from '@radix-ui/themes'

export default function RegisterForm({ onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const data = {
      lastName: formData.get('lastName'),
      firstName: formData.get('firstName'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    }

    console.log('SUBMIT DATA =>', data)
    if (onSubmit) onSubmit(data)
  }

  return (
    <Flex
      align='center'
      justify='center'
      style={{ height: '40vh', width: '100%' }}>
      <Box
        style={{
          width: 420,
          borderRadius: 20,
          padding: 24,
          paddingTop: 0,
        }}>
        {/* ✅ vrai form HTML */}
        <form onSubmit={handleSubmit}>
          <Flex
            direction='column'
            gap='3'>
            <Box style>
              <Text
                size='2'
                weight='medium'>
                Prénom
              </Text>
              <TextField.Root name='firstName' />
            </Box>

            <Box>
              <Text
                size='2'
                weight='medium'>
                Adresse mail
              </Text>
              <TextField.Root
                name='email'
                type='email'
              />
            </Box>

            <Box>
              <Text
                size='2'
                weight='medium'>
                Mot de passe
              </Text>
              <TextField.Root
                name='password'
                type='password'
              />
            </Box>

            <Box>
              <Text
                size='2'
                weight='medium'>
                Confirmer le mot de passe
              </Text>
              <TextField.Root
                name='confirmPassword'
                type='password'
              />
            </Box>

            <Button
              type='submit'
              style={{ marginTop: 12, cursor: 'pointer' }}>
              S’inscrire
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  )
}
