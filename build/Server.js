import { McpServer, ResourceTemplate, } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import api from './api/axiosApi.js';
// import ar from "zod/v4/locales/ar.js"
// localStorage.setItem("token", token)
const server = new McpServer({
    name: "brello-mcp-server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
        prompts: {},
    },
});
server.tool("createBoard", "create new board", {
    boardId: z.string(),
    boardTitle: z.string(),
    isStarred: z.boolean(),
}, {
    title: "Create Board",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
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
server.resource("localJSONboards", "localboards://all", {
    description: "Get all users data from the json file",
    title: "boards",
    mimeType: "application/json",
}, async (uri) => {
    const users = await import("./data/berllo boards.json", {
        with: { type: "json" },
    }).then(m => m.default);
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
server.resource("ServerBoards", "boards://all", {
    description: "Get all boards data from the database",
    title: "boards",
    mimeType: "application/json",
}, async (uri) => {
    try {
        const { data: boards } = await api.get('/board');
        return {
            contents: [
                {
                    uri: uri.href,
                    text: JSON.stringify(boards),
                    mimeType: "application/json",
                },
            ],
        };
    }
    catch (error) {
        console.error("Error fetching boards:", error);
        return {
            contents: [
                {
                    uri: uri.href,
                    text: JSON.stringify({ error: "Failed to fetch boards" }),
                    mimeType: "application/json",
                },
            ],
        };
    }
});
server.resource("board-details", new ResourceTemplate("board://{boardId}/", { list: undefined }), {
    description: "Get a board's details from database",
    title: "User Details",
    mimeType: "application/json",
}, async (uri, { boardId }) => {
    try {
        const board = await api.get(`/board/${boardId}`);
        return {
            contents: [
                {
                    uri: uri.href,
                    text: JSON.stringify(board),
                    mimeType: "application/json",
                },
            ],
        };
    }
    catch (error) {
        console.error("Error fetching boards:", error);
        return {
            contents: [
                {
                    uri: uri.href,
                    text: JSON.stringify({ error: "Failed to fetch board" }),
                    mimeType: "application/json",
                },
            ],
        };
    }
});
// server.resource(
//   "board-by-id",
//   new ResourceTemplate("boards://{_Id}/", { list: undefined }),
//   {
//     description: "Get a user's details from teh database",
//     title: "User Details",
//     mimeType: "application/json",
//   },
//   async (uri, { boardId }) => {
//     // const board = await import("./data/berllo boards.json", {
//     //   with: { type: "json" },
//     // }).then(m => m.default)
//     // const user = users.find(u => u.id === parseInt(userId as string))
//     try {
//     } catch (error) {
//     }
//     if (board == null) {
//       return {
//         contents: [
//           {
//             uri: uri.href,
//             text: JSON.stringify({ error: "User not found" }),
//             mimeType: "application/json",
//           },
//         ],
//       }
//     }
server.resource("boardById", "board://one", {
    description: "board data by id from the database",
    title: "boardById",
    mimeType: "application/json",
}, async (uri) => {
    const users = await import("./data/berllo boards.json", {
        with: { type: "json" },
    }).then(m => m.default);
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
async function createBoard(args) {
    const workSpace = await import("./data/berllo boards.json", {
        with: { type: "json" },
    }).then((m) => m.default);
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
