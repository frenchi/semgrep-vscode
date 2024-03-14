import {
  VSCodeButton,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import { useState } from "react";
import { State } from "../../types/state";

import styles from "./SearchResults.module.css";
import { SearchResultEntry } from "./SearchResultEntry";
import { vscode } from "../../utilities/vscode";
import { VscReplaceAll } from "react-icons/vsc";

export interface SearchResultsProps {
  state: State | undefined;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ state }) => {
  const numMatches = state?.results.locations.reduce(
    (acc, result) => acc + result.matches.length,
    0
  );
  const numFiles = state?.results.locations.length;

  if (state === undefined) {
    return null;
  }

  function onFixAll() {
    if (state !== undefined) {
      vscode.sendMessageToExtension({
        command: "webview/semgrep/replaceAll",
        matches: state.results,
      });
    }
  }

  const status = state.searchConcluded ? "" : "(searching)";

  return (
    <div>
      <div className={styles["matches-summary"]}>
        {`${numMatches} matches in ${numFiles} files ${status}`}
        <div className={styles["replace-all-button"]} onClick={onFixAll}>
          <VscReplaceAll role="button" title="Replace All" tabIndex={0} />
        </div>
      </div>
      {state.results.locations.map((result) => (
        <SearchResultEntry result={result} />
      ))}
    </div>
  );
};
