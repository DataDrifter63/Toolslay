"use client";

import ToolComingSoon from "@/components/tools/ToolComingSoon";
import { TOOL_COMPONENTS } from "@/tools-impl/registry";

// Client-side bridge between the (server) tool page and the registry of
// code-split tools. Because the `next/dynamic` imports live in a client module,
// webpack emits one small async chunk per tool and a page only downloads the
// chunk for the tool it shows. The tool is still server-rendered into the HTML.
export default function ToolRenderer({ slug, toolName }) {
  const ToolComponent = TOOL_COMPONENTS[slug];
  return ToolComponent ? <ToolComponent /> : <ToolComingSoon toolName={toolName} />;
}
