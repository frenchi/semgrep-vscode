import { vscode } from "./../../utilities/vscode";
import {
  VSCodeButton,
  VSCodeTextArea,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";
import { Store, useSearch, useStore } from "../../hooks/useStore";

const style = {
  // this makes it not quite as weirdly tall
  "--design-unit": "2",
  // I tried setting the borderRadius directly and it doesn't work.
  // For some reason it just doesn't show up in the styles.
  // This does, though.
  "--corner-radius": "2",
  // padding: "2px 0",
  width: "100%",
};

export interface TextBoxProps {
  onNewSearch: (scanID: string) => void;
  isMultiline: boolean;
  keyName: keyof Store;
  placeholder?: string;
  description?: string;
}
export const TextBox: React.FC<TextBoxProps> = ({
  onNewSearch,
  placeholder,
  isMultiline,
  keyName,
  description,
}) => {
  const [content, setContent] = useStore(keyName);
  const numRows = isMultiline ? content.split("\n").length : 1;

  return (
    <>
      {description && <h4>{description}</h4>}
      <VSCodeTextArea
        autofocus
        placeholder={placeholder}
        style={style}
        rows={numRows}
        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key == "Enter" && !e.shiftKey) {
            e.preventDefault();
            useSearch(onNewSearch);
          }
        }}
        value={content}
        // I literally have no idea what the type of this or the below handler should be
        // We use the onChange here because there's a delta between when the onKeyPress
        // is fired and when the value is updated
        onInput={(e: any) => {
          setContent(e.target.value);
        }}
      />
    </>
  );
};
