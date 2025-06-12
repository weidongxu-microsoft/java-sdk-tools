# Java SDK Tools

possible tools:

1. client code generation tool, either from typespec/swagger  -> azure/3rd party service developer
2. generate MCP server from swagger/tsp  -> azure/3rd party service developer
3. supporting vibe coding  -> azure sdk user
4. azure sdk for java quick start project -> azure sdk user
5. azure package release status  -> sdk owner
6. azure service status check by api-version  -> sdk owner
7. check rest api repo CI error  -> sdk owner/azure service team


User story 1:
target user: azure/3rd party service developer

I want to make an existing service as MCP server.

1. generate client to access the server using service defined swagger
1. define MCP server using swagger. e.g. https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp
2. generate MCP server stub code
3. in each tool, use the generated client to call real server

This includes tools: client code generation and mcp server code generation.  It targets on Java AI application developers. It could be packaged/shipped as 'Java agent tools for AI developer'. (just a draft name, we can refine later)

User story 2:
target user: azure sdk user

I want to build a hello world web application and deploy to azure

1. create azure sdk for java quick start project
2. tell agent what I want to build
3. generate the code call azure java sdk
4. Run the code and check if the web application is deployed
   
This includes tools: vibe coding, init quick start proj. 


