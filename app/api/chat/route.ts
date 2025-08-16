import { streamText } from "ai"
import { mistral } from "@ai-sdk/mistral"

export async function POST(req: Request) {
  try {
    const { messages, agent } = await req.json()

    console.log("[v0] Chat API called with agent:", agent)

    if (agent === "Web Agent") {
      // Forward to web agent API
      const webAgentResponse = await fetch(new URL("/api/web-agent", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })
      if (!webAgentResponse.ok) {
        throw new Error("Web Agent request failed")
      }

      const webAgentResult = await webAgentResponse.text()

      // Return as plain text stream
      return new Response(webAgentResult, {
        headers: { "Content-Type": "text/plain" },
      })
    }

    if (agent === "Github Agent") {
      const result = await streamText({
        model: mistral("mistral-large-latest"),
        messages,
        system: `You are a GitHub Agent specialized in helping with GitHub-related tasks, repository management, and Git workflows.

When responding:
- Focus on GitHub best practices
- Provide Git commands and workflows
- Help with repository setup and management
- Assist with GitHub Actions and CI/CD
- Guide on collaboration and pull request workflows

Format your responses with clear explanations and code examples.`,
      })

      return result.toTextStreamResponse()
    }

    // Default agent behavior
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
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
