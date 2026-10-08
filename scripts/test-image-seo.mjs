// Test script to draft and validate SEO entries for 16 Image & PDF tools plus 4 Color tools
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadTools, loadKeywords, loadRegistryFolders, toolFacts, norm } from "./lib/seo-shared.mjs";

console.log("Ready to draft entries.");
