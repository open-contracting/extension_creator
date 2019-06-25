# OCDS Extension Creator

A tool to generate extensions to OCDS schema.

## Getting Started

Choose the schema file you want to patch.

![readme1](https://cloud.githubusercontent.com/assets/5618508/25894498/eea77d1e-3573-11e7-8dd9-0a1f7eb8d35a.png)

Copy the schema file to the target section and modify it.

![readme2](https://cloud.githubusercontent.com/assets/5618508/25895421/b23f9506-3577-11e7-9ab3-6f38133aeb92.png)

Generate the patch with your modifications. You can download just the patch file or a zipped file with a complete OCDS extension bundle.

![readme3](https://cloud.githubusercontent.com/assets/5618508/25894798/3e81bfba-3575-11e7-811e-e94970cd5449.png)

Ready? [Open the OCDS Extension Creator!](https://open-contracting.github.io/extension_creator/)

## Installation

To run the OCDS Extension Creator locally, clone the repository and run:

```shell
npm install .
```

This repository uses [webpack](https://webpack.js.org/). To re-compile the static files, run, from the root of the repository:

```shell
node_modules/.bin/webpack
```

Or, if you have webpack installed globally, run:

```shell
webpack.js
```

## Maintenance

Replace the tags in the URLs, then run:

```shell
curl https://standard.open-contracting.org/schema/1__1__3/record-package-schema.json > record-package-schema/record-package-schema-1.1.json
curl https://standard.open-contracting.org/schema/1__1__3/release-package-schema.json > release-package-schema/release-package-schema-1.1.json
curl https://standard.open-contracting.org/schema/1__1__3/release-schema.json > release-schema/release-schema-1.1.json

node_modules/.bin/webpack
```

Or, locally, in the `standard` repository, set `translate`'s `version` keyword argument to `1.1` in `conf.py` and build the documentation, then run:

```shell
cp ../standard/build/en/record-package-schema.json record-package-schema/record-package-schema-1.1.json
cp ../standard/build/en/release-package-schema.json release-package-schema/release-package-schema-1.1.json
cp ../standard/build/en/release-schema.json release-schema/release-schema-1.1.json

node_modules/.bin/webpack
```
