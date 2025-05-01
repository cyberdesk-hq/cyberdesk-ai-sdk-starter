
<h1 align="center">Cyberdesk AI SDK Computer Use Demo</h1>

<p align="center">
  An open-source AI chatbot app template demonstrating Anthropic Claude 3.7 Sonnet's computer use capabilities, built with Next.js, Cyberdesk, and the AI SDK by Vercel.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>
<br/>

## Features

- Streaming text responses powered by the [AI SDK by Vercel](https://sdk.vercel.ai/docs), allowing multiple AI providers to be used interchangeably with just a few lines of code.
- Integration with Anthropic Claude 3.7 Sonnet's computer use tool and bash tool capabilities.
- Sandbox environment with [Cyberdesk](https://cyberdesk.io) for secure execution.
- [shadcn/ui](https://ui.shadcn.com/) components for a modern, responsive UI powered by [Tailwind CSS](https://tailwindcss.com).
- - Learn more about Cyberdesk in the [Cyberdesk Docs](https://docs.cyberdesk.io).
- Built with the latest [Next.js](https://nextjs.org) App Router.

## Running Locally

1. Clone the repository and install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. Set up your environment variables in a `.env.local` file. You will need at least `ANTHROPIC_API_KEY` and `CYBERDESK_API_KEY`.

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view your new AI chatbot application.

## Authors

This repository is maintained by the [Cyberdesk](https://cyberdesk.io) team and community contributors.

Contributions are welcome! Feel free to open issues or submit pull requests to enhance functionality or fix bugs.
