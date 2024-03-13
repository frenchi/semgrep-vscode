import {
  ExtensionContext,
  OutputChannel,
  Uri,
  WorkspaceConfiguration,
} from "vscode";
import { window, workspace } from "vscode";

import { LSP_LOG_FILE, VSCODE_CONFIG_KEY, VSCODE_EXT_NAME } from "./constants";
import { DEFAULT_LSP_LOG_URI, Logger } from "./utils";
import { SemgrepSearchProvider } from "./searchResultsTree";
import { SemgrepDocumentProvider } from "./showAstDocument";
import { LanguageClient } from "vscode-languageclient/node";
import { SemgrepSearchWebviewProvider } from "./views/webview";

export class Config {
  get cfg(): WorkspaceConfiguration {
    return workspace.getConfiguration(VSCODE_CONFIG_KEY);
  }
  get<T>(path: string): T | undefined {
    return this.cfg.get<T>(path);
  }

  get trace(): boolean {
    return this.cfg.get<string>("trace.server") == "verbose";
  }

  get path(): string {
    return this.cfg.get<string>("path") ?? "semgrep";
  }
}

export class Environment {
  private _config: Config = new Config();
  semgrep_log: Uri = DEFAULT_LSP_LOG_URI;
  private _client: LanguageClient | null = null;
  private _provider: SemgrepSearchWebviewProvider | null = null;
  private constructor(
    readonly context: ExtensionContext,
    config: Config,
    readonly searchView: SemgrepSearchProvider,
    readonly documentView: SemgrepDocumentProvider,
    readonly channel: OutputChannel,
    readonly logger: Logger,
    public version: string = "",
    public startupPromise?: Promise<void>
  ) {
    this._config = config;
    this.semgrep_log = Uri.joinPath(context.logUri, LSP_LOG_FILE);
  }

  get config(): Config {
    return this._config;
  }

  set config(config: Config) {
    this._config = config;
  }

  get loggedIn(): boolean {
    return this.context.globalState.get("loggedIn", false);
  }

  set loggedIn(val: boolean) {
    this.context.globalState.update("loggedIn", val);
  }

  get showNudges(): boolean {
    return this.context.globalState.get("showNudges", true);
  }

  set showNudges(val: boolean) {
    this.context.globalState.update("showNudges", val);
  }

  get newInstall(): boolean {
    return this.context.globalState.get("newInstall", true);
  }
  set newInstall(val: boolean) {
    this.context.globalState.update("newInstall", val);
  }

  set client(client: LanguageClient | null) {
    this._client = client;
  }

  get client(): LanguageClient | null {
    if (!this._client) {
      window.showWarningMessage("Semgrep Language Server not active");
    }
    return this._client;
  }

  set provider(provider: SemgrepSearchWebviewProvider) {
    this._provider = provider;
  }

  get provider(): SemgrepSearchWebviewProvider | null {
    if (!this._provider) {
      window.showWarningMessage("Semgrep Search Webview not active");
    }
    return this._provider;
  }

  static async create(context: ExtensionContext): Promise<Environment> {
    const config = await Environment.loadConfig(context);
    const channel = window.createOutputChannel(VSCODE_EXT_NAME);
    const logger = new Logger(config.trace, channel);
    const searchView = new SemgrepSearchProvider();
    const documentView = new SemgrepDocumentProvider();
    return new Environment(
      context,
      config,
      searchView,
      documentView,
      channel,
      logger
    );
  }

  static async loadConfig(context: ExtensionContext): Promise<Config> {
    const config = new Config();
    if (config.trace) {
      await Environment.initLogDir(context);
    }

    return config;
  }

  static async initLogDir(context: ExtensionContext): Promise<void> {
    return workspace.fs.createDirectory(context.logUri);
  }

  async reloadConfig(): Promise<Environment> {
    // Reload configuration
    this.config = await Environment.loadConfig(this.context);
    this.logger.enableLogger(this.config.trace);
    return this;
  }

  dispose(): void {
    this.channel.dispose();
  }
}
