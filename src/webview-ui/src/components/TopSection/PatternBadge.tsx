import styles from "./MainInputs.module.css";
import { VscAdd, VscChevronDown } from "react-icons/vsc";
import { isLast, simplePattern } from "./PatternList";
import { VscCircleSlash } from "react-icons/vsc";

export interface PatternBadgeProps {
  index: number | null;
  patterns: simplePattern[];
  positive: boolean;
  onNewPattern: () => void;
  onPositivityToggle: () => void;
}
export const PatternBadge: React.FC<PatternBadgeProps> = ({
  onNewPattern,
  index,
  patterns,
  positive,
  onPositivityToggle,
}) => {
  const last = isLast(index, patterns);
  const color = positive ? "#458c4c" : "#a23636";
  const heightOfAdd = last ? "15px" : "27px";
  const heightOfChevron = last ? "7px" : "0px";
  return (
    <div>
      <div
        style={{ backgroundColor: color, height: heightOfAdd }}
        className={styles.positivityButton}
        onClick={onPositivityToggle}
      >
        {positive ? <VscAdd /> : <VscCircleSlash />}
      </div>
      {last && (
        <div
          className={styles.addPatternButton}
          style={{ height: heightOfChevron, marginTop: "4px" }}
          onClick={onNewPattern}
        >
          <VscChevronDown />
        </div>
      )}
    </div>
  );
};
