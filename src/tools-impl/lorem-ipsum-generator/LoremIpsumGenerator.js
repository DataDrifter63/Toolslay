"use client";

import React, { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/tools/ui/ToolLayout";
import SettingsPanel from "@/components/tools/ui/SettingsPanel";
import FormField from "@/components/tools/ui/FormField";
import ToolInput from "@/components/tools/ui/ToolInput";
import ToolSelect from "@/components/tools/ui/ToolSelect";
import ToolCheckbox from "@/components/tools/ui/ToolCheckbox";
import ToolTextarea from "@/components/tools/ui/ToolTextarea";
import Button from "@/components/tools/ui/Button";
import OutputPanel from "@/components/tools/ui/OutputPanel";
import CopyButton from "@/components/tools/ui/CopyButton";
import DownloadButton from "@/components/tools/ui/DownloadButton";

// REFERENCE IMPLEMENTATION — every "settings on the left, output on the right"
// generator tool should follow this same structure. Only the generation logic
// changes per tool; the surrounding UI (ToolLayout/SettingsPanel/OutputPanel +
// shared inputs/buttons) stays identical everywhere.

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed",
  "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
  "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris",
  "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in",
  "reprehenderit", "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur",
  "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];

const TYPE_OPTIONS = [
  { value: "paragraphs", label: "Paragraphs" },
  { value: "sentences", label: "Sentences" },
  { value: "words", label: "Words" },
];

const FORMAT_OPTIONS = [
  { value: "plain", label: "Plain Text" },
  { value: "html", label: "HTML Tags (<p>)" },
];

export default function LoremIpsumGenerator() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [format, setFormat] = useState("plain");
  const [generatedText, setGeneratedText] = useState("");

  const getRandomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

  const generateSentence = () => {
    const length = Math.floor(Math.random() * 8) + 8;
    let sentence = [];
    for (let i = 0; i < length; i++) sentence.push(getRandomWord());
    sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
    return sentence.join(" ") + ".";
  };

  const generateParagraph = () => {
    const length = Math.floor(Math.random() * 4) + 4;
    let paragraph = [];
    for (let i = 0; i < length; i++) paragraph.push(generateSentence());
    return paragraph.join(" ");
  };

  const handleGenerate = useCallback(() => {
    let output = [];
    const safeCount = Math.min(Math.max(1, count), 1000);

    if (type === "words") {
      for (let i = 0; i < safeCount; i++) output.push(getRandomWord());
      if (startWithLorem && safeCount >= 5) {
        output.splice(0, 5, "Lorem", "ipsum", "dolor", "sit", "amet");
      }
      setGeneratedText(output.join(" "));
      return;
    }

    if (type === "sentences") {
      for (let i = 0; i < safeCount; i++) output.push(generateSentence());
      let text = output.join(" ");
      if (startWithLorem) {
        text = text.replace(/^[^.]+/, "Lorem ipsum dolor sit amet, consectetur adipiscing elit");
      }
      setGeneratedText(text);
      return;
    }

    if (type === "paragraphs") {
      for (let i = 0; i < safeCount; i++) {
        let para = generateParagraph();
        if (i === 0 && startWithLorem) {
          para = para.replace(/^[^.]+/, "Lorem ipsum dolor sit amet, consectetur adipiscing elit");
        }
        output.push(para);
      }
      setGeneratedText(
        format === "html" ? output.map((p) => `<p>${p}</p>`).join("\n\n") : output.join("\n\n")
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, type, startWithLorem, format]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  return (
    <ToolLayout
      settings={
        <SettingsPanel title="Generator Settings" icon="Settings2">
          <FormField label="Quantity">
            <ToolInput
              type="number"
              min="1"
              max="1000"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            />
          </FormField>

          <FormField label="Generate">
            <ToolSelect options={TYPE_OPTIONS} value={type} onChange={(e) => setType(e.target.value)} />
          </FormField>

          {type === "paragraphs" && (
            <FormField label="Output Format">
              <ToolSelect options={FORMAT_OPTIONS} value={format} onChange={(e) => setFormat(e.target.value)} />
            </FormField>
          )}

          <ToolCheckbox
            label={'Start with "Lorem ipsum dolor sit amet..."'}
            checked={startWithLorem}
            onChange={(e) => setStartWithLorem(e.target.checked)}
          />

          <Button icon="RefreshCw" fullWidth onClick={handleGenerate}>
            Generate Text
          </Button>
        </SettingsPanel>
      }
      output={
        <OutputPanel
          title="Generated Text"
          actions={
            <>
              <CopyButton text={generatedText} />
              <DownloadButton
                text={generatedText}
                filename={`lorem-ipsum-${Date.now()}.${format === "html" ? "html" : "txt"}`}
              />
            </>
          }
        >
          <ToolTextarea
            readOnly
            value={generatedText}
            spellCheck="false"
            className="min-h-[400px] font-mono leading-relaxed"
          />
        </OutputPanel>
      }
    />
  );
}
