import { createTransport } from "@smithery/sdk"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { generateText, dynamicTool, stepCountIs } from "ai"
import { mistral } from "@ai-sdk/mistral"
import { z } from "zod/v3"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]

    if (!process.env.SMITHERY_API_KEY) {
      return new Response(JSON.stringify({ error: "SMITHERY_API_KEY is required" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const transport = createTransport("https://server.smithery.ai/@Aas-ee/open-websearch", {
      apiKey: process.env.SMITHERY_API_KEY,
    })

    const client = new Client({ name: "WebSearchClient", version: "1.0.0" })
    await client.connect(transport)

    const { tools: toolDefs } = await client.listTools()
    const searchDef = toolDefs.find((t) => t.name === "search")

    if (!searchDef) {
      await client.close()
      return new Response(JSON.stringify({ error: "Search tool not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const adaptedTools = {
      search: dynamicTool({
        description: searchDef.description ?? "Web search",
        inputSchema: z.object({
          query: z.string(),
          limit: z.number().optional(),
          engines: z.array(z.string()).optional(),
        }),
        execute: async (args) => {
          return await client.callTool({ name: "search", arguments: args })
        },
      }),

      fetchLinuxDoArticle: dynamicTool({
        description: "Fetch article content from Linux.do",
        inputSchema: z.object({
          url: z.string(),
        }),
        execute: async (args) => {
          return await client.callTool({ name: "fetchLinuxDoArticle", arguments: args })
        },
      }),

      fetchCsdnArticle: dynamicTool({
        description: "Fetch article content from CSDN",
        inputSchema: z.object({
          url: z.string(),
        }),
        execute: async (args) => {
          return await client.callTool({ name: "fetchCsdnArticle", arguments: args })
        },
      }),

      fetchGithubReadme: dynamicTool({
        description: "Fetch README from GitHub repository",
        inputSchema: z.object({
          url: z.string(),
        }),
        execute: async (args) => {
          return await client.callTool({ name: "fetchGithubReadme", arguments: args })
        },
      }),

      fetchJuejinArticle: dynamicTool({
        description: "Fetch article content from Juejin",
        inputSchema: z.object({
          url: z.string(),
        }),
        execute: async (args) => {
          return await client.callTool({ name: "fetchJuejinArticle", arguments: args })
        },
      }),
    }

    const result = await generateText({
      model: mistral("mistral-large-latest"),
      tools: adaptedTools,
      toolChoice: "auto",
      stopWhen: stepCountIs(5),
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
      system: `You are a Web Search Agent powered by advanced search capabilities. You can search the web, fetch articles from various platforms, and provide comprehensive information with sources.

When responding:
- Use web search to find current and accurate information
- Fetch full articles when URLs are relevant
- Provide sources and citations
- Give comprehensive answers with context
- Format responses clearly with markdown

Available tools:
- search: General web search
- fetchLinuxDoArticle: Get Linux.do articles
- fetchCsdnArticle: Get CSDN articles  
- fetchGithubReadme: Get GitHub repository READMEs
- fetchJuejinArticle: Get Juejin articles`,
    })

    await client.close()

    // Return the final text response
    return new Response(result.text, {
      headers: { "Content-Type": "text/plain" },
    })
  } catch (error) {
    console.error("Web Agent error:", error)
    return new Response(JSON.stringify({ error: "Failed to process web search request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
