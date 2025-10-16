#!/bin/bash

mise trust
mise use node@24 pnpm@10 python@3 uv@latest
mise install
pnpm i
gh auth setup-git
