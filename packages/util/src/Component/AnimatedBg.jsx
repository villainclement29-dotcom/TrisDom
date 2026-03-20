import React from 'react'
import { Box } from '@radix-ui/themes'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

const AnimatedBg = React.memo(() => (
    <Box style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <DotLottieReact
            src="/Background.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
        />
    </Box>
))
export default AnimatedBg
