import { useRef, useState } from 'react'
import { useNavigate } from 'raviger'
import { Flex, Box, Button, Text } from '@radix-ui/themes'

import { login } from '@agentix/base/src/actions/login'
import { register } from '@agentix/base/src/actions/register'
import LoginForm from './Login'
import RegisterForm from './Register'
import { initial } from 'lodash'


export default function Connexion() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const navigate = useNavigate()




  // LOGIN
  const handleLogin = async ({ email, password }) => {
    const { error } = await login(email, password)
    if (error) {
      console.error('Erreur login:', error.message)
      return
    }
    navigate('/Gallery')
  }

  // REGISTER
  const handleRegister = async (formData) => {
    const { email, password, confirmPassword, firstName } = formData

    if (password !== confirmPassword) {
      console.error('Les mots de passe ne correspondent pas')
      return
    }

    const { error } = await register(email, password, firstName)
    if (error) {
      console.error('Erreur Supabase:', error.message)
      return
    }

    navigate('/Gallery')
  }

  return (
    <Box
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ✅ Background Lottie */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',

          background:
            'radial-gradient(circle at 20% 30%, rgba(3, 184, 255, 0.95) 0%, transparent 55%),' +
            'radial-gradient(circle at 80% 20%, rgba(1, 17, 163, 0.85) 0%, transparent 55%),' +
            'radial-gradient(circle at 50% 80%, rgba(21, 172, 241, 0.9) 0%, transparent 60%),' +
            'radial-gradient(circle at 10% 90%, rgba(10, 15, 26, 0.9) 0%, transparent 60%)',

          backgroundSize: '200% 200%',
          animation: 'bgShift 14s ease-in-out infinite alternate',

          filter: 'blur(18px)',
          transform: 'scale(1.12)', // statique, pas animé
        }}
      />

      <style>{`
@keyframes bgShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 50% 100%; }
}
`}</style>



      {/* ✅ UI AU-DESSUS */}
      <Flex
        align="center"
        justify="center"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          padding: 24,
        }}
      >
        {/* ✅ Grand container blanc arrondi */}
        <Flex
          style={{
            width: 'min(1100px, 95vw)',
            height: 'min(640px, 90vh)',
            backgroundColor: 'white',
            borderRadius: 48,
            overflow: 'hidden',
          }}
        >
          {/* ====== COLONNE GAUCHE : FORM ====== */}
          <Flex
            direction="column"
            style={{
              flex: 1,
              padding: 56,
              gap: 20,
              minWidth: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box style={{ textAlign: 'center' }}>
              <Text as="div" size="6" weight="bold">
                Welcome To Trisdom
              </Text>
              <Text as="div" size="2" style={{ opacity: 0.6 }}>
                Please enter your details.
              </Text>
            </Box>

            {/* ✅ Toggle */}
            <Flex gap="2" justify="center">
              <Button
                onClick={() => setMode('login')}
                style={{
                  width: 160,
                  borderRadius: 999,
                  backgroundColor: mode === 'login' ? '#1E40AF' : '#E5E7EB',
                  color: mode === 'login' ? 'white' : '#111827',
                  cursor: 'pointer',
                }}
              >
                Connexion
              </Button>

              <Button
                onClick={() => setMode('register')}
                style={{
                  width: 160,
                  borderRadius: 999,
                  backgroundColor: mode === 'register' ? '#1E40AF' : '#E5E7EB',
                  color: mode === 'register' ? 'white' : '#111827',
                  cursor: 'pointer',
                }}
              >
                Inscription
              </Button>
            </Flex>

            {/* ✅ Form */}
            <Box style={{ width: 'min(380px, 100%)', margin: '0 auto' }}>
              {mode === 'login' ? (
                <LoginForm onSubmit={handleLogin} />
              ) : (
                <RegisterForm onSubmit={handleRegister} />
              )}
            </Box>
          </Flex>

          {/* ====== COLONNE DROITE : IMAGE ====== */}
          <Flex
            display={{ initial: 'none', md: 'flex' }}
            align="center"
            justify="center"
            style={{
              flex: 1,
              padding: 32,
              backgroundColor: 'white',
            }}
          >
            <Box
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'white',
                borderRadius: 48,
                display: 'flex',
              }}
            >
              <Box
                style={{
                  flex: 1,
                  borderRadius: 40,
                  backgroundImage: "url('/backgroundConnexion.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )

}
