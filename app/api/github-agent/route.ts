import { createTransport } from "@smithery/sdk"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { generateText, dynamicTool, stepCountIs } from "ai"
import { mistral } from "@ai-sdk/mistral"
import { z } from "zod/v3"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!process.env.SMITHERY_API_KEY) {
      return new Response(JSON.stringify({ error: "SMITHERY_API_KEY is required for GitHub Agent" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const transport = createTransport("https://server.smithery.ai/@sourcebot-dev/sourcebot", {
      apiKey: process.env.SMITHERY_API_KEY,
    })

    const client = new Client({ name: "SourcebotClient", version: "1.0.0" })
    await client.connect(transport)

    const { tools: toolDefs } = await client.listTools()

    const adaptedTools = {}

    for (const t of toolDefs) {
      adaptedTools[t.name] = dynamicTool({
        description: t.description ?? t.name,
        inputSchema:
          t.name === "search_code"
            ? z.object({
                query: z.string(),
                filterByRepoIds: z.array(z.string()).optional(),
                filterByLanguages: z.array(z.string()).optional(),
                caseSensitive: z.boolean().optional(),
                includeCodeSnippets: z.boolean().optional(),
                maxTokens: z.number().optional(),
              })
            : t.name === "get_file_source"
              ? z.object({
                  fileName: z.string(),
                  repoId: z.string(),
                })
              : z.object({}),
        execute: async (args) => {
          const result = await client.callTool({ name: t.name, arguments: args })
          return result
        },
      })
    }

    const { steps } = await generateText({
      model: mistral("mistral-large-latest"),
      tools: adaptedTools,
      toolChoice: "auto",
      stopWhen: stepCountIs(3),
      prompt: `You are a GitHub Agent that can search code repositories and fetch file contents. User query: ${message}`,
    })

    await client.close()

    let response = ""
    let hasResults = false

    steps.forEach((step, index) => {
      if (step.text) {
        response += step.text + "\n\n"
      }

      if (step.toolResults?.length) {
        hasResults = true
        step.toolResults.forEach((result) => {
          const data = result.result

          if (data.content) {
            // Handle search results
            if (data.content.results) {
              response += `## Search Results\n\n`
              response += `Found **${data.content.totalResults || data.content.results.length}** results across **${data.content.uniqueRepositories || "multiple"}** repositories:\n\n`

              data.content.results.slice(0, 10).forEach((item, idx) => {
                response += `### ${idx + 1}. ${item.repository || "Repository"}\n`
                if (item.path) response += `📁 **File:** \`${item.path}\`\n`
                if (item.language) response += `💻 **Language:** ${item.language}\n`
                if (item.snippet) {
                  response += `\`\`\`${item.language?.toLowerCase() || "text"}\n${item.snippet}\n\`\`\`\n`
                }
                response += `🔗 [View on GitHub](${item.url || "#"})\n\n`
              })

              if (data.content.results.length > 10) {
                response += `*... and ${data.content.results.length - 10} more results*\n\n`
              }
            }
            // Handle file content
            else if (data.content.source) {
              response += `## File Content\n\n`
              response += `\`\`\`${data.content.language || "text"}\n${data.content.source}\n\`\`\`\n\n`
            }
            // Handle other content types
            else {
              response += `## Results\n\n`
              response += JSON.stringify(data.content, null, 2) + "\n\n"
            }
          } else {
            // Fallback for unexpected data structure
            response += `## Results\n\n`
            response += JSON.stringify(data, null, 2) + "\n\n"
          }
        })
      }
    })

    // Add helpful message if no results
    if (!hasResults) {
      response += "\n\n*No results found. Try refining your search query or check if the repository exists.*"
    }

    return new Response(JSON.stringify({ response }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("GitHub Agent error:", error)
    return new Response(JSON.stringify({ error: "Failed to process GitHub Agent request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
