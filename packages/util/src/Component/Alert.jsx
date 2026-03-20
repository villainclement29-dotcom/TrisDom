import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Button, Flex, Heading, Text } from '@radix-ui/themes'

export function Alert({ open, onOpenChange }) {
    return (
        <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
            <AlertDialog.Portal>
                <AlertDialog.Overlay
                    style={{
                        background: 'rgba(0,0,0,0.4)',
                        position: 'fixed',
                        inset: 0,
                    }}
                />
                <AlertDialog.Content
                    style={{
                        maxWidth: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        background: 'white',
                        borderRadius: '16px',
                        padding: '30px',
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0px 10px 40px rgba(0,0,0,0.15)',
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    }}
                >
                    <Heading as="h1" size="4" trim="both" style = {{
                    fontWeight: 'bold',
                    fontSize: '20px',
                    }}>
                        Attention !
                    </Heading>

                    <Text as="p" size="2" color="gray" mt="2">
                        Vous devez d'abord créer une leçon avant de pouvoir générer Cela.
                    </Text>

                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel asChild>
                            <Button variant="soft"  style={{
                                backgroundColor: '#3E63DD',
                                color: 'white',
                                padding: '8px',
                                borderRadius: '8px',
                                textAlign:'center',
                                cursor: 'pointer',
                                border: '1px #b3b3b3ff solid',
                                fontWeight: 'bold',
                            }}>
                                Suivant
                            </Button>
                        </AlertDialog.Cancel>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    )
}
