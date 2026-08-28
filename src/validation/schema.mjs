function pointerGet(value, pointer) {
  if (!pointer || pointer === "#") return value;
  const parts = pointer.replace(/^#\//, "").split("/").map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
  return parts.reduce((current, part) => current?.[part], value);
}

function typeMatches(value, type) {
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "array") return Array.isArray(value);
  if (type === "string") return typeof value === "string";
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "boolean") return typeof value === "boolean";
  return true;
}

/** A deliberately small JSON Schema 2020-12 subset used by this dependency-free MVP. */
export function validateJsonSchema(value, schema, { schemas = {}, rootSchema = schema, path = "$" } = {}) {
  const issues = [];
  if (!schema) return [`${path}: schema is missing`];

  if (schema.$ref) {
    const [file, fragment] = schema.$ref.split("#");
    const referencedRoot = file ? schemas[file] : rootSchema;
    const referenced = pointerGet(referencedRoot, fragment ? `#${fragment}` : "#");
    if (!referenced) return [`${path}: unresolved schema reference ${schema.$ref}`];
    return validateJsonSchema(value, referenced, { schemas, rootSchema: referencedRoot, path });
  }

  if (schema.type && !typeMatches(value, schema.type)) {
    return [`${path}: expected ${schema.type}`];
  }
  if (schema.enum && !schema.enum.includes(value)) {
    return [`${path}: must be one of ${schema.enum.join(", ")}`];
  }
  if (schema.const !== undefined && value !== schema.const) {
    return [`${path}: must equal ${JSON.stringify(schema.const)}`];
  }
  if (schema.type === "object") {
    for (const key of schema.required ?? []) {
      if (!(key in value)) issues.push(`${path}.${key}: is required`);
    }
    const properties = schema.properties ?? {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) issues.push(`${path}.${key}: additional property is not allowed`);
      }
    }
    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in value) issues.push(...validateJsonSchema(value[key], childSchema, { schemas, rootSchema, path: `${path}.${key}` }));
    }
  }
  if (schema.type === "array") {
    if (schema.minItems !== undefined && value.length < schema.minItems) issues.push(`${path}: must contain at least ${schema.minItems} item(s)`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) issues.push(`${path}: items must be unique`);
    if (schema.items) value.forEach((item, index) => issues.push(...validateJsonSchema(item, schema.items, { schemas, rootSchema, path: `${path}[${index}]` })));
  }
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) issues.push(`${path}: must not be empty`);
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) issues.push(`${path}: does not match ${schema.pattern}`);
  }
  return issues;
}
