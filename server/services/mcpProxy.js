import fs from 'node:fs/promises';
import path from 'node:path';

// For the MVP, mcpProxy reads the one-time data dump created via the agent's MCP connection.
// This fulfills the 'eCourts API / MCP -> One-time fetch' architecture without requiring
// real-time continuous SDK tunneling or consuming API credits per search.

export async function getMcpData() {
  const filePath = path.join(process.cwd(), 'data', 'ecourts_import.json');
  try {
    const rawData = await fs.readFile(filePath, 'utf-8');
    // Extract JSON from the MCP XML wrapper
    const jsonMatch = rawData.match(/<raw_json>([\s\S]*?)<\/raw_json>/);
    if (!jsonMatch) {
      // Fallback if the file is purely JSON
      return JSON.parse(rawData);
    }
    return JSON.parse(jsonMatch[1]).data;
  } catch (error) {
    console.error("Failed to read MCP data dump:", error);
    return { results: [] };
  }
}
