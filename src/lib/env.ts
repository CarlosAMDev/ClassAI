export function validateEnv() {
  const required = [
    'VITE_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'OPENROUTER_API_KEY',
    'DATABASE_URL',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }
}

validateEnv()
