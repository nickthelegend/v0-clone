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

    // Mock response for Web Agent
    const mockResponse = `## Web Search Results

I searched the web for information related to: "${lastMessage.content}"

### Key Findings:
- Current web development trends and best practices
- Latest React and TypeScript updates
- Modern web development tools and frameworks

### Summary:
Based on current web development standards, I recommend focusing on:
1. **Modern React patterns** - Hooks, Context, and Server Components
2. **TypeScript integration** - Type safety and better DX
3. **Performance optimization** - Code splitting and lazy loading
4. **Responsive design** - Mobile-first approach

### Resources:
- React Documentation
- TypeScript Handbook
- Web.dev Performance Guides

*Note: Web Agent is in development mode. Full functionality coming soon.*`

    return new Response(mockResponse, {
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
