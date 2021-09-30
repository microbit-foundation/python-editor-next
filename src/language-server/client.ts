/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import EventEmitter from "events";
import {
  CompletionList,
  CompletionParams,
  CompletionRequest,
  Diagnostic,
  DiagnosticTag,
  DidChangeTextDocumentNotification,
  DidCloseTextDocumentNotification,
  DidCloseTextDocumentParams,
  DidOpenTextDocumentNotification,
  InitializedNotification,
  InitializeParams,
  InitializeRequest,
  LogMessageNotification,
  MessageConnection,
  PublishDiagnosticsNotification,
  PublishDiagnosticsParams,
  RegistrationRequest,
  ServerCapabilities,
  TextDocumentContentChangeEvent,
  TextDocumentItem,
} from "vscode-languageserver-protocol";

/**
 * Create a URI for a source document under the default root of file:///src/.
 */
export const createUri = (name: string) => `file:///src/${name}`;

/**
 * Owns the connection.
 *
 * Exposes methods for the core text document notifications from
 * client to server for the app to implement.
 *
 * Tracks and exposes the diagnostics.
 */
export class LanguageServerClient extends EventEmitter {
  /**
   * The capabilities of the server we're connected to.
   * Populated after initialize.
   */
  capabilities: ServerCapabilities | undefined;
  private versions: Map<string, number> = new Map();
  private diagnostics: Map<string, Diagnostic[]> = new Map();

  constructor(
    public connection: MessageConnection,
    private options: {
      rootUri: string;
      initializationOptions: () => Promise<any>;
    }
  ) {
    super();
  }

  on(
    event: "diagnostics",
    listener: (params: PublishDiagnosticsParams) => void
  ): this {
    super.on(event, listener);
    return this;
  }

  currentDiagnostics(uri: string): Diagnostic[] {
    return this.diagnostics.get(uri) ?? [];
  }

  async initialize(): Promise<void> {
    this.connection.onNotification(LogMessageNotification.type, (params) =>
      console.log("[LS]", params.message)
    );

    this.connection.onNotification(
      PublishDiagnosticsNotification.type,
      (params) => {
        this.diagnostics.set(params.uri, params.diagnostics);
        // Republish as you can't listen twice.
        this.emit("diagnostics", params);
      }
    );
    this.connection.onRequest(RegistrationRequest.type, () => {
      // Ignore. I don't think we should get these at all given our
      // capabilities, but Pyright is sending one anyway.
    });

    const initializeParams: InitializeParams = {
      capabilities: {
        textDocument: {
          hover: {
            contentFormat: ["markdown"],
          },
          moniker: {},
          synchronization: {
            willSave: false,
            didSave: false,
            willSaveWaitUntil: false,
          },
          completion: {
            completionItem: {
              snippetSupport: false,
              commitCharactersSupport: true,
              documentationFormat: ["markdown"],
              deprecatedSupport: false,
              preselectSupport: false,
            },
            contextSupport: true,
          },
          publishDiagnostics: {
            tagSupport: {
              valueSet: [DiagnosticTag.Unnecessary, DiagnosticTag.Deprecated],
            },
          },
        },
        workspace: {
          workspaceFolders: true,
          didChangeConfiguration: {},
          configuration: true,
        },
      },
      initializationOptions: await this.options.initializationOptions(),
      processId: null,
      // Do we need both of these?
      rootUri: this.options.rootUri,
      workspaceFolders: [
        {
          name: "src",
          uri: this.options.rootUri,
        },
      ],
    };
    const { capabilities } = await this.connection.sendRequest(
      InitializeRequest.type,
      initializeParams
    );
    this.capabilities = capabilities;
    this.connection.sendNotification(InitializedNotification.type, {});
  }

  didOpenTextDocument(params: {
    textDocument: Omit<TextDocumentItem, "version">;
  }): void {
    this.connection.sendNotification(DidOpenTextDocumentNotification.type, {
      textDocument: {
        ...params.textDocument,
        version: this.nextVersion(params.textDocument.uri),
      },
    });
  }

  // We close Python files that are deleted. We never write to the file system,
  // so that way they're effectively deleted.
  didCloseTextDocument(params: DidCloseTextDocumentParams): void {
    this.connection.sendNotification(
      DidCloseTextDocumentNotification.type,
      params
    );
  }

  didChangeTextDocument(
    uri: string,
    contentChanges: TextDocumentContentChangeEvent[]
  ): void {
    this.connection.sendNotification(DidChangeTextDocumentNotification.type, {
      textDocument: {
        uri,
        version: this.nextVersion(uri),
      },
      contentChanges,
    });
  }

  async completionRequest(params: CompletionParams): Promise<CompletionList> {
    const results = await this.connection.sendRequest(
      CompletionRequest.type,
      params
    );
    if (!results) {
      // Not clear how this should be handled.
      return { items: [], isIncomplete: true };
    }
    return "items" in results
      ? results
      : { items: results, isIncomplete: true };
  }

  dispose() {
    this.connection.dispose();
  }

  private nextVersion(uri: string): number {
    const version = (this.versions.get(uri) ?? 0) + 1;
    this.versions.set(uri, version);
    return version;
  }
}
