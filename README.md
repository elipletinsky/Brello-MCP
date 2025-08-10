# Brello MCP Server

A Model Context Protocol (MCP) server implementation for a Trello-like board management system using modern TypeScript and Node.js.

**Backend Repo:** [Brello Backend](https://github.com/senpaiharde/berllo-backend)

## Technologies & Patterns

### Core Technologies
- **TypeScript** - For type-safe code and better developer experience
- **Node.js** - Runtime environment
- **Model Context Protocol (MCP)** - Using `@modelcontextprotocol/sdk` for server implementation
- **Axios** - For HTTP requests to the backend server

### Architecture

#### MCP Server Structure
The server is built using the Model Context Protocol (MCP) pattern with three main types of interactions:
1. **Resources** - For data fetching operations
2. **Tools** - For data manipulation operations
3. **Prompts** - For user interactions

#### Dual Data Storage Strategy
The server implements two parallel data management approaches:
1. **Local JSON Storage**
   - Direct file system operations using `node:fs/promises`
   - JSON file-based persistence
   - Used for offline and development scenarios

2. **Remote API Integration**
   - RESTful API communication using Axios
   - Token-based authentication
   - Real-time data synchronization

### Key Components

#### 1. Resource Endpoints
- `get-local-JSON-boards` - Fetches boards from local JSON
- `get-server-Boards` - Fetches boards from remote server
- `get-board-by-id-from-json` - Retrieves Detailed board information from local JSON
- `get-board-by-id` - Retrieves Detailed board information from remote server

#### 2. Tools
- `create-local-board-in-json` - Creates new board in local JSON
- `create-board-in-DB` - Creates new board in remote database
- `create-task-list-in-DB` - Creates new taskList with reference to board in remote database
- `create-task-in-DB` - Creates new task with references to taskList and board in remote database

### Authentication
- JWT-based authentication
- Automatic token management via Axios interceptors
- Demo login functionality with predefined credentials

### Error Handling
- Comprehensive try-catch blocks
- Consistent error response format
- Error logging for debugging

## Project Structure
```
src/
├── Server.ts           # Main MCP server implementation
├── api/
│   └── axiosApi.ts    # API client configuration
└── data/
    └── berllo boards.json  # Local storage
```

## Implementation Details

### MCP Server Configuration
```typescript
const server = new McpServer({
  name: "brello-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
    prompts: {},
  }
})
```

### API Integration
- Base URL configuration with environment variable support
- Automatic token injection into requests
- Error handling middleware

## Development

### Prerequisites
- Node.js
- TypeScript
- npm/yarn

### Available Scripts
- `npm run server:build` - Build the TypeScript code
- `npm run server:build:watch` - Watch mode for development
- `npm run server:dev` - Run the development server
- `npm run server:inspect` - Run with MCP inspector
- `npm run client:dev` - Run the client

## Dependencies
- `@modelcontextprotocol/sdk`: ^1.17.0
- `axios`: ^1.11.0
- `zod`: ^3.25.67
- `typescript`: ^5.8.3

## Design Patterns
1. **Repository Pattern** - Abstraction of data storage
2. **Dependency Injection** - Via MCP server configuration
3. **Observer Pattern** - For handling async operations
4. **Factory Pattern** - For creating resources and tools
5. **Singleton Pattern** - For API client instance

## Future Improvements
1. Implement websocket for real-time updates
2. Add caching layer for frequently accessed data
3. Implement offline-first capability
4. Add comprehensive testing suite
