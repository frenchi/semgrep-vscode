import { useState } from "react";
import { MainInputs } from "./MainInputs";

import styles from "./TopSection.module.css";
import { VscEllipsis } from "react-icons/vsc";
import { TextBox } from "../utils/TextBox";
import { State } from "../../types/state";
import { MatchesSummary } from "./MatchesSummary";
import { useSetStore, Store } from "../../hooks/useStore";

export interface TopSectionProps {
  onNewSearch: (scanID: string) => void;
  state: State | null;
  store: Store;
}
export const TopSection: React.FC<TopSectionProps> = ({
  onNewSearch,
  state,
  store,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className={styles.topSection}>
      <MainInputs store={store} onNewSearch={onNewSearch} state={state} />
      <div>
        <div
          role="button"
          onClick={() => setShowOptions(!showOptions)}
          className={styles.optionButton}
        >
          <VscEllipsis />
        </div>
        {showOptions && (
          <TextBox
            description="files to include"
            onNewSearch={onNewSearch}
            isMultiline={false}
            value={store.includes}
            onChange={(value: string) => useSetStore("includes", value)}
            store={store}
          />
        )}
        {showOptions && (
          <TextBox
            description="files to exclude"
            onNewSearch={onNewSearch}
            isMultiline={false}
            value={store.excludes}
            onChange={(value: string) => useSetStore("excludes", value)}
            store={store}
          />
        )}
      </div>
      <MatchesSummary state={state} />
    </div>
  );
};
