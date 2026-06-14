---
name: RAGForge backend run command
description: The API server runs Python uvicorn via artifact.toml; cannot be overridden with configureWorkflow
---
The api-server workflow is artifact-managed. Its run command is set in:
  artifacts/api-server/.replit-artifact/artifact.toml → [services.development].run

The run command is:
  cd /home/runner/workspace/ragforge/backend && uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

**Why:** configureWorkflow returns PROHIBITED_ACTION for artifact-managed workflows.

**How to apply:** To change the backend run command, use verifyAndReplaceArtifactToml on the api-server artifact.toml, then restart_workflow "artifacts/api-server: API Server".

The backend auto-reloads via uvicorn --reload on Python file changes — no restart needed for code edits.
