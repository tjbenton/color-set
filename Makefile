.DEFAULT_GOAL:= watch
PATH := ./node_modules/.bin:$(PATH)
SHELL := /bin/bash
args = $(filter-out $@, $(MAKECMDGOALS))
.PHONY: data test run watch

# runs install script
install:
	@yarn install

# cleans the dist directory and node_modules
clean:
	@rm -rf dist
clean-deep:
	@make clean
	@rm -rf node_modules

# builds on jenkins/openshift
build:
	@babel --copy-files src -d dist $(args)

# runs eslint
lint:
	@eslint '+(src)/**/*.+(js|mjs)' --cache --fix

# cleans and installs node modules
reinstall:
	@make clean-deep install

# runs graphql server that refreshes on change
watch:
	@make build -- --watch
