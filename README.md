# E Commerce

e-commerce project

## Getting Started

This project was initialized with C4 Modeler.

### Project Structure

```
e-commerce/
├── codegen/                 # Code generation configuration
│   ├── model/              # C4 model definitions
│   │   └── index.yml       # Project root model
│   └── ...
├── client/                 # Client application (if applicable)
└── package.json
```

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

```bash
npm install
# or
npm run setup
```

### Available Commands

See `package.json` scripts section for available commands.

### C4 Modeler

Open the C4 Modeler to visualize and edit your architecture:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "C4 Modeler: Open C4 Modeler"
3. Start modeling!

### Version

- Project Version: 0.0.0
- C4 Modeler Version: See `c4modeler.version.json`

## Aspire Prerequisites

This section describes the prerequisites required to use the Aspire orchestrator with CAEP Codegen.

### Required Installations

#### 1. VSCode Aspire Extension

Install the official Microsoft Aspire extension for Visual Studio Code:

- Extension ID: `microsoft-aspire.aspire-vscode`
- Install from the Extensions panel in VSCode or via the command line:
  ```bash
  code --install-extension microsoft-aspire.aspire-vscode
  ```

#### 2. Aspire CLI

Install the .NET Aspire CLI following the official documentation:

- https://learn.microsoft.com/dotnet/aspire/cli/install

#### 3. Dapr CLI

Install the Dapr CLI following the official documentation:

- https://docs.dapr.io/getting-started/install-dapr-cli/

After installing the Dapr CLI, initialize Dapr by running:

```bash
dapr init
```

This command sets up the Dapr runtime environment locally (including the placement service, Redis, and Zipkin containers).

#### 4. Reload VSCode

After completing all installations, reload VSCode to ensure extensions and CLI tools are correctly recognized.

### Recommended Extensions

#### C# Dev Kit

It is recommended to install the **C# Dev Kit** extension for an improved development experience with .NET/C# projects in VSCode:

- https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csdevkit
- Extension ID: `ms-dotnettools.csdevkit`

Install from the Extensions panel or via:

```bash
code --install-extension ms-dotnettools.csdevkit
```

### Enabling Hot Reload in VSCode

To enable Hot Reload during debugging sessions:

1. Open VSCode **Settings** (`Ctrl+,` or `Cmd+,` on macOS).
2. Search for `csharp experimental debug hotreload`.
3. Enable the option **C# > Experimental > Debug: Hot Reload**.

This allows you to apply code changes to a running application without restarting the debug session, significantly speeding up the development workflow.

## License

See LICENSE file for details.
