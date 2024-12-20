# **SwagGen**
Dynamic TypeScript Model Generator from OpenAPI Schemas

**SwagGen** is a robust and flexible solution to dynamically generate **TypeScript models** from OpenAPI 3.0 schemas. This tool automates the generation of models, resolves dependencies, and simplifies project management with features like barrel file creation and customizable model naming.

---

## 🚀 **Features**

- **Automatic Model Generation**: Convert OpenAPI schemas into TypeScript interfaces.
- **Dependency Management**: Detects and resolves nested dependencies.
- **Barrel File Generation**: Simplifies imports with automatically generated `index.ts` files.
- **Customizable Model Naming**: Remove, replace, prepend, or append strings to model names.
- **Import Statement Generation**: Ensures clean and relevant imports for all models.
- **Support for `allOf` and `$ref`**: Handles inheritance and schema references seamlessly.
- **Configurable File Extensions**: Supports `.ts`, `.tsx`, or other custom file types.
- **Compatibility**: Works with **PNPM**, **NPM**, and **Yarn**.

---

## 📄 **Table of Contents**

1. [Installation](#installation)
2. [Usage](#usage)
3. [Configuration Options](#configuration-options)
4. [Example Workflow](#example-workflow)
5. [Advanced Features](#advanced-features)
6. [Upcoming Features](#upcoming-features)
7. [Development](#development)
8. [License](#license)
9. [Support](#support)

---

## Installation

Ensure you have **Node.js** and your preferred package manager installed.

### Install via PNPM (Recommended)
```bash
pnpm install
```

### Install via NPM
```bash
npm install
```

### Install via Yarn
```bash
yarn install
```

---

## Usage

SwagGen processes OpenAPI schemas and generates TypeScript models. Here is the typical usage workflow:

### **1. Setup Your Project**

Create or point to an OpenAPI schema file (`swagger.json` or `swagger.yaml`).

Alternatively, provide a URL for live OpenAPI specifications:
```bash
https://petstore3.swagger.io/api/v3/openapi.json
```

---

### **2. Run the Model Generator**

Add the following script to your `index.ts` file:

```ts
import { ProcessSchemas } from "./@helpers";
import { generateBarrelFiles } from "./@utils";
import { resolveDynamicRefs } from "./@utils/path/resolveDynamicRefs";
import { generateImportStatement, writeImportStatements } from "./@utils/importStatement";

async function generateModels() {
    const rootDir = "src";
    const baseDir = "models";    
    const inputPath = "https://petstore3.swagger.io/api/v3/openapi.json";

    // Step 1: Load and parse OpenAPI schemas
    const schemas = require(`./${inputPath}`).components.schemas;

    // Step 2: Process schemas to generate models
    const options = {
        modelNameTransform: {
            remove: ["Dto"],
            prepend: "Swag",
            append: "Interface"
        }
    };
    const dependencyMap = await ProcessSchemas(schemas, rootDir, baseDir, "", options);

    // Step 3: Generate barrel files
    await generateBarrelFiles(rootDir, baseDir);

    // Step 4: Resolve dynamic references
    const resolvedRefs = await resolveDynamicRefs(rootDir, baseDir);

    // Step 5: Generate and write import statements
    const importStatements = generateImportStatement(rootDir, baseDir, "", resolvedRefs);
    await writeImportStatements(dependencyMap, resolvedRefs, importStatements, rootDir, baseDir, "");
}

generateModels().catch(console.error);
```

Run the generator:
```bash
pnpm ts-node index.ts
```

---

## Configuration Options

### ProcessSchemas Options

| Option               | Type                 | Description                                          |
|----------------------|----------------------|------------------------------------------------------|
| `defaultCategory`    | `string`             | Default category for models (e.g., "common").        |
| `defaultFolder`      | `string`             | Default folder for models (e.g., "model").           |
| `modelNameTransform` | `Object`             | Rules for transforming model names.                  |
| `beforeWrite`        | `Function`           | Callback executed before writing a file.             |
| `afterWrite`         | `Function`           | Callback executed after successfully writing a file. |

#### **Model Name Transformation**

```ts
modelNameTransform: {
    remove: ["Dto"],
    replace: { "List": "Collection" },
    prepend: "Swag",
    append: "Interface"
}
```

**Result**:
- `CategoryDto` ➞ `SwagCategoryInterface`
- `CategoryListDto` ➞ `SwagCategoryCollectionInterface`

---

## Example Workflow

**Input OpenAPI Schema**:
```json
{
  "components": {
    "schemas": {
      "CategoryDto": {
        "type": "object",
        "properties": {
          "id": { "type": "number" },
          "name": { "type": "string" }
        }
      },
      "CategoryListDto": {
        "allOf": [{ "$ref": "#/components/schemas/CategoryDto" }],
        "properties": {
          "items": { "type": "array", "items": { "$ref": "#/components/schemas/CategoryDto" } }
        }
      }
    }
  }
}
```

**Generated Output** (`src/models/category/model/Category.ts`):
```ts
/**
 * SwagCategoryInterface
 */
export interface SwagCategoryInterface {
  /**
   * ID
   */
  id: number;

  /**
   * Name
   */
  name: string;
}

/**
 * SwagCategoryCollectionInterface
 */
export interface SwagCategoryCollectionInterface extends SwagCategoryInterface {
  /**
   * Items
   */
  items: SwagCategoryInterface[];
}
```
---

## Advanced Features

### **Barrel File Generation**

Barrel files (`index.ts`) are automatically created for each directory to simplify imports:

**Example**:
```ts
export * from './Category';
export * from './CategoryList';
```

### **Import Statement Generation**

- Automatically generates imports for all nested dependencies.
- Filters out unnecessary imports and ensures no duplicates.

---

## Upcoming Features

We are actively working on additional features to make **SwagGen** even more powerful and versatile. Here's a sneak peek at what's coming:

### 🔧 Generate Class Structures

#### Purpose
Generate classes alongside interfaces for models, enabling dynamic processing and seamless front-end integration.

#### How It Works
Classes will be created based on interfaces and enriched with metadata to support:
- **Dynamic processing**
- **Validation**
- **UI integration**

#### Structure Example
```typescript
type: ModelFieldType.STRING,
defaultValue: '',
required: true,
label: 'firstName',
placeholder: 'enterFirstName'
```

#### Benefits
- Dynamically handle model rendering.
- Simplify form validation.
- Streamline user interactions on the front end.

---

### 📜 Generate Contracts

#### Purpose
Automatically generate contract interfaces for APIs to:
- **Standardize communication** between front-end and back-end.
- **Simplify API integration.**

#### Benefits
- Enforced API contracts.
- Consistent and reusable data models.

---

### 📦 Generate Repositories

#### Purpose
Introduce repository patterns for handling API requests and centralize logic.

#### Benefits
- Improved maintainability of API interactions.
- Enhanced testability of network operations.
- Decoupled and modular data access layers.

---

### 🛠️ Generate Services

#### Purpose
Automatically generate service files for business logic, derived from OpenAPI paths.

#### How It Works
- Dynamically integrate these services into Redux structures.
- Facilitate seamless state management and business logic handling.

#### Features
- **Dynamic Redux Integration:**
  - Auto-generate actions, reducers, and middleware.
  - Tailored state management for each service.

#### Benefits
- Scalable business logic.
- Streamlined Redux workflow.

---

### 📂 Generate APIs

#### Purpose
Auto-generate API clients based on OpenAPI specifications.

#### Features
- Typed API methods.
- Built-in error handling.
- Full compatibility with the OpenAPI spec.

#### Benefits
- Faster API integration.
- Reliable and type-safe API calls.

---

### 🔄 Generate Type Mappings

#### Purpose
Map API schemas to strongly typed models, ensuring data consistency across your application.

#### Features
- Type-safe mappings for API responses and requests.
- Streamlined handling of API data.

#### Benefits
- Improved developer experience.
- Confidence in type-safe operations.

---

## 🚀 Stay Tuned

We are constantly enhancing **SwagGen** with more features and improvements to empower developers. Keep an eye out for updates!

---

## Development

To contribute or extend **SwagGen**:

1. Clone the repository:
   ```bash
   git clone https://github.com/doallon/SwagGen.git
   cd SwagGen
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the project in development mode:
   ```bash
   pnpm run dev
   ```

4. Build the project:
   ```bash
   pnpm run build
   ```

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Support

If you encounter issues or have any questions:
- Open an issue on [GitHub](https://github.com/doallon/SwagGen/issues).
- Submit a pull request for contributions.

---

**SwagGen** – Simplify your TypeScript model generation with ease! 🚀
