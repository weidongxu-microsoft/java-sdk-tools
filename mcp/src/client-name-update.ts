export async function clientNameUpdateCookbook(oldName: string, newName: string): Promise<any> {
  const cookbook = `
  Follow below instruction to update old client name to new client name in both client.tsp and the generated Java SDK.

# How to Update the Client Name in the Generated Java SDK

1. **Synchronize the TypeSpec source for Java SDK**

  Find the directory in the workspace that contains 'tsp-location.yaml'. Use the tool to synchronize the TypeSpec source for the Java SDK.

2. **Look at all \`.tsp\` files under folder 'TempTypeSpecFiles' and get the path of the Model or Operation or operation parameter declaration with ${oldName}**

  Look for the model or operation you want to rename under '.tsp' files. Get the path of the model or operation. For example, model \`OldModelName\`'s path is 'Azure.Communication.MessagesService.OldModelName', operation 'sendMessage''s path is 'Azure.Communication.MessagesService.AdminOperations.sendMessage'.
  \`\`\`typespec
  namespace Azure.Communication.MessagesService;

  model OldModelName {
  // model properties
  }

  interface AdminOperations {
    @path("/messages")
    operation sendMessage(@body message: OldModelName): void;
  }
  \`\`\`

3. **Update client.tsp**

  Use and founded path and @clientName decorator to update the client name to ${newName}. 
  For example, for model \`OldModelName\`, you can add below line to \`NewModelName\` to client.tsp like this. Update operation name or operation parameter name are similar.
  \`\`\`typespec
  
@@clientName(Azure.Communication.MessagesService.OldModelName,
  "NewModelName",
  "java"
);
  \`\`\`

5. **Generate the Java SDK**

  Find the directory in the workspace that contains 'tsp-location.yaml'. Use the tool to generate the Java SDK.

6. **Update Downstream Code**

  If you have already generated code or documentation that references the old model name, update those references as well.

---

**Tip:** Use your IDE’s “rename symbol” or “find and replace” feature to ensure you update all references safely.
  `;

  console.error(`Generated client name update cookbook:\n${cookbook}`);

  return {
    content: [
      {
        type: "text",
        text: cookbook,
      },
    ],
  };
}
