import { streamText } from "ai"
import { mistral } from "@ai-sdk/mistral"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: mistral("mistral-large-latest"),
    messages,
    system: `You are an expert full-stack developer and AI assistant. You help users build web applications by generating clean, modern code using React, Next.js, TypeScript, and Tailwind CSS.

When generating code:
- Always use TypeScript
- Use modern React patterns (hooks, functional components)
- Apply Tailwind CSS for styling
- Include proper error handling
- Write clean, readable code with comments
- Follow best practices for performance and accessibility

Format your responses with clear explanations and well-structured code blocks.`,
  })

  return result.toTextStreamResponse()
}
