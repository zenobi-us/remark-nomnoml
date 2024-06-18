export PATH := justfile_directory() + "/node_modules/.bin:" + env_var('PATH')

default:
    @just --list

setup:
    @echo ""
    @echo "🍜 Setting up project"
    @echo ""

    @yarn install

    @echo ""
    @echo "👍 Done"
    @echo ""

lint:
    @eslint --ext .ts .

types:
    tsc --noEmit \
        --project \
        ./tsconfig.json

test:
    vitest

build:
    tsup \
        --dts \
        --cjsInterop

    attw --pack

docs:
    typedoc \
        --plugin typedoc-plugin-markdown \
        --tsconfig ./tsconfig.lib.json \
        --out dist/docs \
        ./src/remark-nomnoml.ts \
            --hideBreadcrumbs true \
            --namedAnchors true \
            --disableSources \
            --readme ./README.md \
            --hideInPageTOC true \
            --hidePageTitle true \
            --hideGenerator true

    inject-markdown ./README.md

    rm -rf dist/docs

publish STAGE="":
    #!/bin/bash
    set -e

    local tag
    case $(STAGE) in
        prod)
            tag=latest
            ;;
        *)
            tag=next
            ;;
    esac

    npm publish --access public --tag "${tag}"
