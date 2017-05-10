# OCDS Extension Creator

A tool to generate extensions for OCDS schema.

## Usage

Choose the schema file you want to patch.

![readme1](https://cloud.githubusercontent.com/assets/5618508/25894498/eea77d1e-3573-11e7-8dd9-0a1f7eb8d35a.png)

  
  
  
Copy the schema file to the target section and modify it.

![readme2](https://cloud.githubusercontent.com/assets/5618508/25895421/b23f9506-3577-11e7-9ab3-6f38133aeb92.png)

  
  
  
Generate the patch with your modifications. You can download just the patch file or a zipped file with a complete OCDS extension bundle.

![readme3](https://cloud.githubusercontent.com/assets/5618508/25894798/3e81bfba-3575-11e7-811e-e94970cd5449.png)


## Installation

Clone this repository and run:

`npm install .`

This repository uses [webpack](https://webpack.js.org/). Changes to statics files need to be recompiled running:

`./node_modules/webpack/bin/webpack.js` from the root of the repo.

Or, if you have webpack installed globally, simply running:

`webpack.js`
