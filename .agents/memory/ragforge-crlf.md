---
name: RAGForge Python CRLF
description: Python backend files from the original zip have CRLF line endings, breaking the edit/write tools
---
The Python files in ragforge/backend/ have Windows CRLF line endings (^M at end of each line). This causes the `edit` tool's old_string matching to fail and the `write` tool to reject writes claiming the file hasn't been read.

**Why:** Files were extracted from a Windows-created zip archive (Local-Success-Suite.zip).

**How to apply:** When editing any Python file in ragforge/backend/, always use:
  `bash: cat > /home/runner/workspace/ragforge/backend/app/api/filename.py << 'PYEOF' ... PYEOF`
Never use the edit or write tools for these Python files.
