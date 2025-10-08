import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { SYSTEM_PROMPT } from "@/lib/prompts/system-prompt"

export async function POST(req: Request) {
  try {
    const { messages, agent, fileTree, fileContents } = await req.json()

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
      const githubAgentResponse = await fetch(new URL("/api/github-agent", req.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messages[messages.length - 1]?.content || "" }),
      })

      if (!githubAgentResponse.ok) {
        throw new Error("GitHub Agent request failed")
      }

      const githubAgentResult = await githubAgentResponse.text()

      // Return as plain text stream
      return new Response(githubAgentResult, {
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Default agent behavior with AlgoCraft system prompt
    const result = await streamText({
      model: openai("gpt-3.5-turbo"),  // Cheapest option for testing
      messages,
      system: SYSTEM_PROMPT,
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
