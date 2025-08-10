import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import fs from "node:fs/promises"
import api from "./api/axiosApi.js"

const server = new McpServer({
  name: "brello-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  },
})

//-- Registering resources and tools for local JSON data--
//-- These resources and tools are used to fetch and manipulate data from a local JSON file--

// Resource to get all boards data from the local JSON file
// This resource fetches the entire boards array from the JSON file and returns it as a JSON response
server.resource(
  "get-local-JSON-boards",
  "localboards://all",
  {
    description: "Get all boards data from the json file",
    title: "boards",
    mimeType: "application/json",
  },
  async (uri) => {
    const users = await import("./data/berllo boards.json", {
      with: { type: "json" },
    }).then((m) => m.default)

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users),
          mimeType: "application/json",
        },
      ],
    }
  }
)

// Resource to get a board by its ID from the local JSON file
// This resource fetches the details of a specific board from the boards.json file
// It returns the board data as a JSON response
server.resource(
  "get-board-by-id-from-json",
  "board://one",
  {
    description: "board data by id from the boards.json file",
    title: "boardById",
    mimeType: "application/json",
  },
  async (uri) => {
    const users = await import("./data/berllo boards.json", {
      with: { type: "json" },
    }).then((m) => m.default)

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users),
          mimeType: "application/json",
        },
      ],
    }
  }
)

// Tool to create a new board in the local JSON file
// This tool allows users to create a new board by providing a title, ID, and starred status
// It updates the local JSON file with the new board data
server.tool(
  "create-local-board-in-json",
  "create new board in local json",
  {
    boardId: z.string(),
    boardTitle: z.string(),
    isStarred: z.boolean(),
  },
  {
    title: "Create Local Board",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  async (args) => {
    try {
      const board = await createBoard(args)
      return {
        content: [
          {
            type: "text",
            text: `Board: ${board}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: "An error occurred while Getting Board.",
          },
        ],
      }
    }
  }
)

//-- API resources and tools for interacting with the backend server--
//-- These resources and tools are used to fetch and manipulate data from the backend server--

server.resource(
  "get-server-Boards",
  "boards://all",
  {
    description: "Get all boards data from the database",
    title: "boards",
    mimeType: "application/json",
  },
  async (uri) => {
    try {
      const { data: boards } = await api.get("/board")
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(boards),
            mimeType: "application/json",
          },
        ],
      }
    } catch (error) {
      console.error("Error fetching boards:", error)
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: "Failed to fetch boards" }),
            mimeType: "application/json",
          },
        ],
      }
    }
  }
)

// Resource to get a board by its ID from the database
// This resource fetches the details of a specific board from the backend server
server.resource(
  "get-board-by-id",
  new ResourceTemplate("board://{boardId}/", { list: undefined }),
  {
    description: "Get a board's details from database",
    title: "User Details",
    mimeType: "application/json",
  },
  async (uri, { boardId }) => {
    try {
      const response = await api.get(`/board/${boardId}`)
      // const board = data.board;
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(response.data.board),
            mimeType: "application/json",
          },
        ],
      }
    } catch (error) {
      console.error("Error fetching boards:", error)
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: "Failed to fetch board" }),
            mimeType: "application/json",
          },
        ],
      }
    }
  }
)

// Tool to create a new board in the database
// This tool allows users to create a new board by providing a title
server.tool(
  "create-board-in-DB",
  "create new board",
  {
    boardTitle: z.string(),
  },
  {
    title: "Create Board in database",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const { data: board } = await api.post("/board/", {
        boardTitle: params.boardTitle,
      })
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(board),
          },
        ],
      }
    } catch (error) {
      console.error("Error fetching boards:", error)
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error }),
          },
        ],
      }
    }
  }
)

// Tool to create a new task list in the database
// This tool allows users to create a new task list by providing a parent board ID and a title
server.tool(
  "create-task-list-in-DB",
  "create new List in database",
  {
    parentBoardId: z.string(),
    listTitle: z.string(),
  },
  {
    title: "Create new Task List in database",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const getResponse = await api.get(`/board/${params.parentBoardId}`)
      
      let listIndex = 0
      if (!getResponse.data.lists) {
        listIndex = getResponse.data.lists.length
      }
      const { data: list } = await api.post("/list/", {
        taskListBoard: params.parentBoardId,
        taskListTitle: params.listTitle,
        indexInBoard: listIndex,
      })
      const putResponse = await api.put(`/board/${params.parentBoardId}`,{boardLists: getResponse.data.board.boardLists.concat(list._id)})
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(list),
          },
        ],
      }
    } catch (error) {
      console.error("Error fetching boards:", error)
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error }),
          },
        ],
      }
    }
  }
)

// Tool to create a new task in the database
// This tool allows users to create a new task by providing a parent board ID, parent list ID, and task title
server.tool(
  "create-task-in-DB",
  "create new task in database",
  {
    parentBoardId: z.string(),
    parentListId: z.string(),
    taskTitle: z.string(),
  },
  {
    title: "Create new Task in database",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  async (params) => {
    try {
      const getResponse = await api.get(`/board/${params.parentBoardId}`)
      const list = getResponse.data.lists.find(
        (list: any) => list._id === params.parentListId
      )
      let taskIndex = 0
      if (!list.taskList) {
        taskIndex = list.taskList.length
      }
      const { data: task } = await api.post("/tasks/", {
        board: params.parentBoardId,
        listId: params.parentListId,
        position: taskIndex,
        title: params.taskTitle
      })
      const putResponse = await api.put(`/board/${params.parentBoardId}`,{taskList: list.taskList.concat(task._id)})
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(task),
          },
        ],
      }
    } catch (error) {
      console.error("Error fetching boards:", error)
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error }),
          },
        ],
      }
    }
  }
)

// Function to create a new board in the local JSON file
// This function adds a new board object to the existing boards array in the JSON file
async function createBoard(args: {
  boardId: string
  boardTitle: string
  isStarred: boolean
}) {
  const workSpace = await import("./data/berllo boards.json", {
    with: { type: "json" },
  }).then((m) => m.default)

  workSpace.boards.push({
    _id: args.boardId,
    boardTitle: args.boardTitle,
    isStarred: args.isStarred,
  })
  await fs.writeFile(
    "./src/data/berllo boards.json",
    JSON.stringify(workSpace, null, 2)
  )
  return args.boardTitle
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main()
