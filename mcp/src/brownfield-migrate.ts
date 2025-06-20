export async function brownfieldMigration(): Promise<any> {
  const cookbook = `Follow the instructions below to migrate your the Java SDK to generate from TypeSpec.

  1. Init the Java SDK with the given URL to the tspconfig.yaml file.
`;

  return {
    content: [
      {
        type: "text",
        text: cookbook,
      },
    ],
  };
}
