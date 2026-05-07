.DEFAULT_GOAL := help

VERSION := $(shell node -p "require('./package.json').version" 2>/dev/null || echo 0.1.0)
COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo dev)

.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push

help: ## list all targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "%-22s %s\n", $$1, $$2}'

install-hooks: ## wire .githooks
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## run the frontend dev server
	npm run dev

build: ## build frontend into docs/ for GitHub Pages
	VITE_APP_VERSION=$(VERSION) VITE_COMMIT_SHA=$(COMMIT) npm run build

data: ## Mode A has no static data pipeline
	@echo "No data pipeline for Mode A."

test: ## run unit tests
	npm run test

test-integration: ## run integration tests
	@echo "No separate integration suite for Mode A v1."

smoke: ## build and run Playwright smoke tests against docs/
	npm run smoke

lint: ## run linters and type checks
	npm run lint
	npm run fmt:check
	npx tsc --noEmit

fmt: ## autoformat
	npm run fmt

pages-preview: ## serve docs/ locally as GitHub Pages would
	rm -rf tmp/pages-preview
	mkdir -p tmp/pages-preview/bilateral-memory-processing
	cp -R docs/. tmp/pages-preview/bilateral-memory-processing/
	python3 -m http.server 4173 --directory tmp/pages-preview

release: ## create a semver tag after local checks
	make test
	make build
	make smoke
	git tag v$(VERSION)
	git push origin v$(VERSION)

clean: ## remove local build/test artifacts
	rm -rf dist coverage playwright-report test-results node_modules/.tmp

hooks-pre-commit:
	.githooks/pre-commit

hooks-commit-msg:
	.githooks/commit-msg .git/COMMIT_EDITMSG

hooks-pre-push:
	.githooks/pre-push
