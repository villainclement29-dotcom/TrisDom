import { Flex, Box, Text, TextField, Button, Separator } from '@radix-ui/themes'

export default function LoginForm({ onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
    }

    console.log('LOGIN SUBMIT =>', data)
    if (onSubmit) onSubmit(data)
  }

  return (
      <Box>

        {/* vrai form HTML */}
        <form onSubmit={handleSubmit}>
          <Flex
            direction='column'
            gap='3'>
            <Box>
              <Text
                size='2'
                weight='medium'>
                Adresse mail
              </Text>
              <TextField.Root
                name='email'
                type='email'
                placeholder='email@gmail.com'
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
                placeholder='********'
              />
            </Box>

            <Button
              type='submit'
              style={{ marginTop: 12, cursor: 'pointer' }}>
              Se connecter
            </Button>
          </Flex>
        </form>
      </Box>
  )
}
