{ pkgs, ... }: {
  # Specifies the Nix channel. "stable-24.05" provides a stable set of packages.
  channel = "stable-24.05";

  # Lists the packages to be installed in the environment.
  packages = [
    pkgs.nodejs_20      # Node.js version 20
    pkgs.firebase-tools # Command-line tools for Firebase
  ];

  # Configuration for the IDX environment.
  idx = {
    # A list of VS Code extensions to install from the Open VSX Registry.
    extensions = [
      "dbaeumer.vscode-eslint" # Integrates ESLint for code linting
      "esbenp.prettier-vscode" # Code formatter
    ];

    # Workspace lifecycle hooks.
    workspace = {
      # Commands to run when the workspace is first created.
      onCreate = {
        # Installs project dependencies from package.json.
        # This will be run after we initialize our npm project.
        npm-install = "npm install";
      };
      # Commands to run every time the workspace is (re)started.
      onStart = {
        # A placeholder for starting the development server.
        # We'll configure this properly once the project is set up.
        start-dev-server = "echo 'Run npm run dev to start the server'";
      };
    };

    # Configures a web preview for the application.
    previews = {
      enable = true;
      previews = {
        # Defines a preview named 'web'.
        web = {
          # The command to start the development server.
          # The $PORT variable is dynamically assigned by IDX.
          command = ["npm" "run" "dev" "--" "--port" "$PORT"];
          # Specifies that this is a web server preview.
          manager = "web";
        };
      };
    };
  };
}
