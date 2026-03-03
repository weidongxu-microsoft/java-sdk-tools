# Instructions to mitigate breaks for Java SDK after migrating to TypeSpec

Only modify "client.tsp" and "tspconfig.yaml". Do not modify any other files.
For "client.tsp", group the modifications at the end of the file.
Do read the other ".tsp" files for context.
Do not read ".json" files.

Follow the instructions below to migrate the Java SDK to generate from TypeSpec.

1. Use the #generateJavaSdk tool to generate the Java SDK based on the current TypeSpec.

2. Use the #buildJavaSdk tool to build the JAR.

3. Use the #getJavaSdkChangelog tool to retrieve the changelog for the Java SDK compared to its last stable version. Check the "pom.xml" in the "java-sdk" folder for the groupId and artifactId.

4. Follow "Guide to mitigate breaks" and modify "client.tsp" (add to the end of the file) or "tspconfig.yaml" (add to the block for typespec-java) to mitigate breaks.
  Note that "client.tsp" should import "main.tsp", not vice versa.
  Do not modify other files, particularly "back-compatible.tsp".

5. If there is no change to "client.tsp" or "tspconfig.yaml" in Step 4, then the migration is complete.

6. Run "tsp compile ." and then "tsp format .". If there is an error, try to fix "client.tsp".

7. Use git to commit the changed "client.tsp" or "tspconfig.yaml" file.

8. Return to Step 1 and iterate this process one more time to see if there are any further changes needed.

9. If no further changes are needed, provide a summary of the remaining breaks from the changelog, grouped by category.


# Guide to mitigate breaks

Focus on the "Breaking Changes" and "Features Added" sections.

- Pattern: "models.###Headers" was added.
  Severity: This is likely an error in the TypeSpec source and likely causes breaks in the API. This MUST be reported and investigated by dev.
  Solution: Try to find the TypeSpec source for this model and operation. Report to dev to investigate IMMEDIATELY before mitigating other breaks.

- Pattern: "models.###ListResult" / "models.###ListResponse" / "models.###List" was removed.
  Solution: This is expected, no action needed.

- Pattern: "models.Operation###" was modified / removed.
  Solution: This is expected, no action needed.

- Pattern: "<Constructor>()" was changed to private access
  Solution: This is expected, no action needed.

- Pattern: "fluent.<ClientName> serviceClient()" -> "fluent.<NewClientName> serviceClient()"
  Solution: This is expected, no action needed.

- Pattern: "<ServiceName>Manager" was removed, and a similar "<NewServiceName>Manager" was added.
  Severity: This is a breaking change that MUST be fixed.
  Solution: Edit "tspconfig.yaml", modify or add line under "@azure-tools/typespec-java"
  ```yaml
    service-name: <Service Name>
  ```
  `<Service Name>` above should contain proper spaces.

- Pattern: "models.<ModelName>" was removed, and there is a similar "models.<NewModelName>" was added.
  Severity: This is a breaking change that MUST be fixed.
  Solution: Check the .tsp files to determine whether "<NewModelName>" is a model or an interface.
  1. If it is a model, edit "client.tsp" and add the line
      ```typespec
      @@clientName(<TypeSpecNamespace>.<NewModelName>, "<ModelName>", "java");
      ```
  2. If it is an interface, edit "client.tsp" and for each operation within this interface add the line
      ```typespec
      @@clientLocation(<TypeSpecNamespace>.<NewModelName>.<OperationName>, "<ModelName>", "java");
      ```
  3. If no model or interface is found, check "back-compatible.tsp" and search for lines like
      ```typespec
      @@clientLocation(<TypeSpecNamespace>.<InterfaceName>.<OperationName>, "<NewModelName>");
      ```
     If such `@@clientLocation` entries are found in "back-compatible.tsp", edit "client.tsp" and for each such line add
      ```typespec
      @@clientLocation(<TypeSpecNamespace>.<InterfaceName>.<OperationName>, "<ModelName>", "java");
      ```
     If there is an `@@clientLocation` on the same operation found in "back-compatible.tsp", exclude "java" from there by adding "!java" to its scope.

- Pattern: "<PropertyName>()" was removed, and a similar "<NewPropertyName>()" was added in the same "<ModelName>". It is usually only case changes.
  Severity: This is a breaking change that MUST be fixed.
  Solution: Edit "client.tsp" and add the line
  ```typespec
  @@clientName(<TypeSpecNamespace>.<ModelName>.<NewPropertyName>, "<PropertyName>", "java");
  ```

- Pattern: "java.lang.Object" -> "java.util.Map"
  Severity: This is a breaking change that is recommended to be fixed.
  Solution: Edit "client.tsp", add line
  ```typespec
  @@alternateType(<TypeSpecNamespace>.<ModelName>.<PropertyName>, unknown, "java");
  ```

- Pattern: "java.lang.Object" -> "com.azure.core.util.BinaryData"
  Severity: This is a breaking change that is recommended to be fixed.
  Solution: Edit "tspconfig.yaml", add line under "@azure-tools/typespec-java"
  ```yaml
    use-object-for-unknown: true
  ```

- Pattern: "validate()" was removed
  Severity: This is a breaking change that can be accepted.
  Solution: Edit "tspconfig.yaml", add line under "@azure-tools/typespec-java"
  ```yaml
    client-side-validations: true
  ```

- Pattern: "java.lang.String" -> "java.util.UUID"
  Severity: This is a breaking change that can be accepted.
  Solution: Edit "tspconfig.yaml", add line under "@azure-tools/typespec-java"
  ```yaml
    uuid-as-string: false
  ```

- Pattern: "java.lang.Float" -> "java.lang.Double"
  Severity: This is a breaking change that can be accepted.
  Solution: Edit "tspconfig.yaml", add line under "@azure-tools/typespec-java"
  ```yaml
    float32-as-double: false
  ```
