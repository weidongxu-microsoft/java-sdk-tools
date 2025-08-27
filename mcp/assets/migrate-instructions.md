# Instruction to migitate breaks for Java SDK after migrate to TypeSpec

Only modify "client.tsp" and "tspconfig.yaml". Do not modify any other files.
For "client.tsp", group the modifications at the end of the file.
Do read the other tsp files for context.

Follow the instructions below to migrate the Java SDK to generate from TypeSpec.

1. Use the #generateJavaSdk tool to generate Java SDK, based on current TypeSpec.

2. Use the #buildJavaSdk tool to build Jar.

3. Use the #getJavaSdkChangelog tool to retrieve the changelog for the Java SDK, compared to its last stable version. Check the "pom.xml" in "java-sdk" folder for groupId and artifactId.

4. Follow "Guide to mitigate breaks", modify "client.tsp" (add to the end of the file) or "tspconfig.yaml" (add to the block of typespec-java), to mitigate breaks.

5. If there is no change to "client.tsp" or "tspconfig.yaml" in Step 4, then the migration is complete.

5. Run "tsp compile ." then "tsp format .". If there is error, try fix "client.tsp".

6. Use git to commit the changed "client.tsp" or "tspconfig.yaml" file.

7. Go to Step 1, iterate this process one more time, to see if there are any further changes needed.


# Guide to mitigate breaks

Focus on "Breaking Changes" and "Features Added" section.

- Pattern: "models.###ListResult" / "models.###List" was removed.
  Solution: This is expected, no action needed.

- Pattern: "models.Operation###" was modified / removed.
  Solution: This is expected, no action needed.

- Pattern: "<ServiceName>Manager was removed, and there is a similar "<NewServiceName>Manager" was added.
  Severity: This is a breaking change that MUST be fixed.
  Solution: Edit "tspconfig.yaml", modify or add line under "@azure-tools/typespec-java"
  ```yaml
    service-name: <Service Name>
  ```
  `<Service Name>` above should contain proper spaces.

- Pattern: "models.<ModelName>" was removed, and there is a silimiar "models.<NewModelName>" was added.
  Severity: This is a breaking change that MUST be fixed.
  Solution: Check in tsp files, whether "<NewModelName>" is a model, or an interface.
  If it is a model, edit "client.tsp", add line
  ```typespec
  @@clientName(<TypeSpecNamespace>.<NewModelName>, "<ModelName>", "java");
  ```
  If it is an interface, edit "client.tsp", for each operation within this interface, add line
  ```typespec
  @@clientLocation(<TypeSpecNamespace>.<NewModelName>.<OperationName>, "<ModelName>", "java");
  ```

- Pattern: "<PropertyName>()" was removed, and there is a silimiar "<NewPropertyName>()" was added, in same "<ModelName>". It is usually only case changes.
  Severity: This is a breaking change that MUST be fixed.
  Solution: Edit "client.tsp", add line
  ```typespec
  @@clientName(<TypeSpecNamespace>.<ModelName>.<NewPropertyName>, "<PropertyName>", "java");
  ```

- Pattern: "java.lang.Object" -> "java.util.Map"
  Solution: Edit "client.tsp", add line
  ```typespec
  @@alternateType(<TypeSpecNamespace>.<ModelName>.<PropertyName>, unknown, "java");
  ```

- Pattern: "java.lang.Object" -> "com.azure.core.util.BinaryData"
  Solution: Edit "tspconfig.yaml", add line under "@azure-tools/typespec-java"
  ```yaml
    use-object-for-unknown: true
  ```