import { MatchItem } from "./MatchItem";
import { ViewResult } from "../../types/results";
import { PathHeader } from "./PathHeader";

import styles from "./SearchResults.module.css";

export interface SearchResultEntryProps {
  result: ViewResult;
}
export const SearchResultEntry: React.FC<SearchResultEntryProps> = ({
  result,
}) => {
  const { path } = result;
  return (
    <div>
      <PathHeader path={path} />
      <ul className={styles.matchesList}>
        {result.matches.map((match) => (
          <MatchItem uri={result.uri} match={match} />
        ))}
      </ul>
    </div>
  );
};
