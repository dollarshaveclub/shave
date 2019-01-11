{
  "name": "shave",
  "version": "2.5.2",
  "description": "Shave is a javascript plugin that truncates multi-line text within a html element based on set max height",
  "main": "dist/shave.js",
  "module": "dist/shave.es.js",
  "unpkg": "dist/shave.min.js",
  "files": [
    "dist",
    "src",
    "types"
  ],
  "types": "types/index.d.ts",
  "scripts": {
    "build": "rollup --config rollup.config.js",
    "chore:delete-changelog-branch": "if git show-ref --quiet refs/heads/chore-changelog; then git branch -D chore-changelog; fi",
    "chore:branch": "git checkout -b chore-changelog",
    "chore:changelog": "conventional-changelog -p eslint -i CHANGELOG.md -s -r 0",
    "chore:setup-next-work": "git checkout master && npm run chore:delete-changelog-branch",
    "chore:pr": "git add . && git commit -m '[chore] updates changelog' --no-verify && git push origin chore-changelog -f",
    "chore:setup-changelog": "git checkout master && git pull",
    "chore": "npm run chore:delete-changelog-branch && npm run chore:branch && npm run chore:changelog && npm run chore:pr && npm run chore:setup-next-work",
    "eslint": "eslint . --fix",
    "eslint:ci": "eslint .",
    "postpublish": "git tag $npm_package_version && git push origin --tags && npm run chore",
    "prepush": "npm run build && npm test && npm run eslint:ci",
    "test": "npm run test:acceptance && npm run test:es-check",
    "test:acceptance": "node ./scripts/acceptance.js --coverage",
    "test:es-check": "es-check es5 dist/shave.min.js dist/shave.js dist/jquery.shave.js dist/jquery.shave.min.js"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/dollarshaveclub/shave.git"
  },
  "keywords": [
    "ellipsis",
    "truncate",
    "truncation",
    "truncated",
    "semantic",
    "js",
    "content",
    "shorten",
    "javascript",
    "text",
    "shave",
    "trim"
  ],
  "author": "Jeff Wainwright <yowainwright@gmail.com> (jeffry.in)",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/dollarshaveclub/shave/issues"
  },
  "homepage": "https://github.com/dollarshaveclub/shave#readme",
  "devDependencies": {
    "@babel/core": "^7.0.0-beta.44",
    "@babel/preset-env": "^7.0.0-beta.40",
    "babel-core": "^7.0.0-bridge.0",
    "conventional-changelog-cli": "^2.0.11",
    "es-check": "5.0.0",
    "eslint": "^5.0.0",
    "eslint-config-dollarshaveclub": "^3.1.0",
    "husky": "^1.0.0",
    "node-qunit-phantomjs": "^2.0.0",
    "rollup": "^1.0.0",
    "rollup-plugin-babel": "^4.0.0-beta.0",
    "rollup-plugin-uglify": "^6.0.1",
    "typescript": "^3.0.1"
  }
}
