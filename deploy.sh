#!/bin/bash

rm -rf .git
rm -rf node_modules js
find . -maxdepth 0 -type f ! -name index.html ! -name robots.txt -delete

git init .
git config user.name "Travis Bot"
git config user.email "travis@travis-ci.org"

git remote add github "https://${GH_TOKEN}@github.com/saikrishnadeep/imdbnator.github.io.git"
git add --all
git commit -m "Build $TRAVIS_COMMIT"
git push -qf github HEAD:gh-pages
