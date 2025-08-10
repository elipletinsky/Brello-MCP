import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
const server = new McpServer({
    name: "brello-mcp-server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
        prompts: {},
    },
});
//-- Registering resources and tools for local JSON data--
//-- These resources and tools are used to fetch and manipulate data from a local JSON file--
// Resource to get all boards data from the local JSON file
// This resource fetches the entire boards array from the JSON file and returns it as a JSON response
server.resource("get-local-JSON-boards", "localboards://all", {
    description: "Get all boards data from the json file",
    title: "boards",
    mimeType: "application/json",
}, async (uri) => {
    const users = await import("./data/berllo boards.json", {
        with: { type: "json" },
    }).then((m) => m.default);
    return {
        contents: [
            {
                uri: uri.href,
                text: JSON.stringify(users),
                mimeType: "application/json",
            },
        ],
    };
});
// Resource to get a board by its ID from the local JSON file
// This resource fetches the details of a specific board from the boards.json file
// It returns the board data as a JSON response
server.resource("get-board-by-id-from-json", "board://one", {
    description: "board data by id from the boards.json file",
    title: "boardById",
    mimeType: "application/json",
}, async (uri) => {
    const users = await import("./data/berllo boards.json", {
        with: { type: "json" },
    }).then((m) => m.default);
    return {
        contents: [
            {
                uri: uri.href,
                text: JSON.stringify(users),
                mimeType: "application/json",
            },
        ],
    };
});
// Tool to create a new board in the local JSON file
// This tool allows users to create a new board by providing a title, ID, and starred status
// It updates the local JSON file with the new board data
server.tool("create-local-board-in-json", "create new board in local json", {
    boardId: z.string(),
    boardTitle: z.string(),
    isStarred: z.boolean(),
}, {
    title: "Create Local Board",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
}, async (args) => {
    try {
        const board = await createBoard(args);
        return {
            content: [
                {
                    type: "text",
                    text: `Board: ${board}`,
                },
            ],
        };
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: "An error occurred while Getting Board.",
                },
            ],
        };
    }
});
// Function to create a new board in the local JSON file
// This function adds a new board object to the existing boards array in the JSON file
async function createBoard(args) {
    const workSpace = await import("./data/berllo boards.json", {
        with: { type: "json" },
    }).then((m) => m.default);
    if (args.isStarred === undefined) {
        args.isStarred = false;
    }
    workSpace.boards.push({
        _id: args.boardId,
        boardTitle: args.boardTitle,
        isStarred: args.isStarred,
    });
    await fs.writeFile("./src/data/berllo boards.json", JSON.stringify(workSpace, null, 2));
    return args.boardTitle;
}
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main();
