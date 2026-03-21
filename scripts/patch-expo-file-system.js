const fs = require("fs");
const path = require("path");

const targetFile = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-file-system",
  "ios",
  "FileSystemModule.swift"
);

const oldSnippet =
  "ExpoAppDelegateSubscriberRepository.getSubscriberOfType(FileSystemBackgroundSessionHandler.self)";
const newSnippet =
  "ExpoAppDelegate.getSubscriberOfType(FileSystemBackgroundSessionHandler.self)";

if (!fs.existsSync(targetFile)) {
  console.warn(`[patch-expo-file-system] Skipped: ${targetFile} not found.`);
  process.exit(0);
}

const source = fs.readFileSync(targetFile, "utf8");

if (source.includes(newSnippet)) {
  console.log("[patch-expo-file-system] Already patched.");
  process.exit(0);
}

if (!source.includes(oldSnippet)) {
  console.warn("[patch-expo-file-system] Skipped: expected snippet not found.");
  process.exit(0);
}

fs.writeFileSync(targetFile, source.replace(oldSnippet, newSnippet));
console.log("[patch-expo-file-system] Applied.");
