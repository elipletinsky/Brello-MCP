import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
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
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
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
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
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
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
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

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main()
