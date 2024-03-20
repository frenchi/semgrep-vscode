import { vscode } from "./utilities/vscode";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import "./App.css";
import { webkitCommand } from "../interface/commands";

const App: React.FC = () => {
  return (
    <main>
      <VSCodeTextField
        autofocus
        placeholder="Pattern"
        style={{ padding: "4px 0", width: "100%" }}
        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key == "Enter") {
            vscode.postMessage({
              command: "webkit/semgrep/search",
              pattern: e.currentTarget.value,
            } as webkitCommand);
          }
        }}
      />
    </main>
  );
};

export default App;
