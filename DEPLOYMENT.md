# FAAJI - Whot! Card Game

A modern, multiplayer Whot! card game built with Next.js, Thirdweb, and AI integration.

## Deployment Guide

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Thirdweb Account**: Get your client ID from [thirdweb.com](https://thirdweb.com)
3. **Google AI API Key**: Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Environment Variables

Set these environment variables in your Vercel dashboard:

```bash
# Required for Thirdweb authentication
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
THIRDWEB_AUTH_PRIVATE_KEY=0x_your_64_character_private_key

# Required for AI features
GEMINI_API_KEY=your_gemini_api_key
```

### Deployment Steps

1. **Connect Repository**: Connect your GitHub repository to Vercel
2. **Configure Environment Variables**: Add the variables above in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy your app

### Important Notes

- The `THIRDWEB_AUTH_PRIVATE_KEY` must be a valid 64-character hexadecimal private key
- For production, generate a secure private key using a tool like OpenSSL
- Never commit real private keys to your repository

### Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in your actual API keys
3. Run `npm install`
4. Run `npm run dev`

## Features

- 🎮 Multiplayer Whot! card game
- 🔐 Secure authentication with Thirdweb
- 🤖 AI-powered game features
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: Thirdweb
- **Styling**: Tailwind CSS
- **AI**: Google Gemini
- **Deployment**: Vercel