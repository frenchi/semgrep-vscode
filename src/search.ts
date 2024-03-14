import path = require("path");
import {
  SearchParams,
  SearchResults,
  search,
  searchOngoing,
} from "./lspExtensions";
import { SearchResult, getPreviewChunks } from "./searchResultsTree";
import { ViewResults } from "./webview-ui/src/types/results";
import * as vscode from "vscode";
import { Environment } from "./env";

/*****************************************************************************/
/* Helpers */
/*****************************************************************************/

async function viewResultsOfSearchResults(
  scanID: string,
  results: SearchResults
): Promise<ViewResults> {
  async function viewResultofSearchResult(result: SearchResult) {
    const uri = vscode.Uri.parse(result.uri);
    const doc = await vscode.workspace.openTextDocument(uri);
    const workspacePath = vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : "";
    return {
      uri: result.uri,
      path: path.relative(workspacePath, uri.fsPath),
      matches: await Promise.all(
        result.matches.map(async (match) => {
          const range = new vscode.Range(match.range.start, match.range.end);
          const { before, inside, after } = getPreviewChunks(doc, range);
          return {
            before: before,
            inside: inside,
            after: after,
            isFixed: false,
            isDismissed: false,
            searchMatch: match,
          };
        })
      ),
    };
  }
  return {
    scanID: scanID,
    locations: await Promise.all(
      results.locations.map(viewResultofSearchResult)
    ),
  };
}

/*****************************************************************************/
/* Searching */
/*****************************************************************************/

/* The protocol we have established with the LSP is that we start a search via
   /semgrep/search, and continuously hit it with /semgrep/searchOngoing to
   ask it for new data.
   When we get data, we send it back to the webview.
   This `searchLoop` maintains a tight loop handling each search request, but
   it also uses the unique scan IDs associated to each scan to know to stop
   early, if
 */
async function searchLoop(
  scanID: string,
  env: Environment,
  results: SearchResults | undefined
): Promise<void> {
  if (results === undefined) {
    return;
  }

  /* This could only be true if another asynchronous handleSearch occurred,
     meaning that the search this loop is for has terminated.
     We need to stop this loop, and send no more results to the webview.
   */
  // TODO: This actually has a race condition... if a separate searchLoop
  // changes the scanID after we pass this check, then we might hit the
  // LSP with a /semgrep/searchOngoing request, _after_ the new
  // /semgrep/search.
  // This means that we will get results for the new search, but not send
  // it to the webview.
  if (env.scanID !== null && scanID !== env.scanID) {
    return;
  }

  /* Communicate with the webview! */
  // console.log(results.locations);
  const viewResults = await viewResultsOfSearchResults(scanID, results);
  env.provider?.sendMessageToWebview({
    command: "extension/semgrep/results",
    results: viewResults,
  });

  if (results.locations.length === 0) {
    /* This means we got no results at all.
       Time to stop the loop.
     */
    env.scanID = null;
    return;
  } else {
    /* Otherwise, the streaming is not done. There are more results coming.
       Time to loop!
     */
    const results = await env.client?.sendRequest(searchOngoing);
    searchLoop(scanID, env, results);
  }
}

export async function handleSearch(
  env: Environment,
  searchParams: SearchParams
): Promise<void> {
  env.scanID = searchParams.scanID;
  if (searchParams != null) {
    const results = await env.client?.sendRequest(
      search,
      searchParams.lspParams
    );
    searchLoop(searchParams.scanID, env, results);
  }
}
