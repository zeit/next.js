declare -a testCases=(
  # Tests the webpack require hook
  "progressive-web-app"
  "with-eslint"
  "with-typescript"
  "with-next-sass"
  # Tests @next/mdx
  "with-mdx"
  # Tests babel config
  "with-styled-components"
  "with-styled-jsx"
)

set -e
set -x

# Speeds up testing locally
export CI=1

nextDir=$(pwd)
tempDir=$(mktemp -d)
trap 'rm -rf -- "$tempDir"' EXIT

for testCase in "${testCases[@]}"
do
  testTarget="$tempDir/$testCase"

  mkdir -p "$testTarget"

  echo "--- Testing $testCase ---"
  cp -r "$nextDir/examples/$testCase/." "$testTarget"
  cd "$testTarget"

  touch yarn.lock
  yarn set version berry

  # Temporary fix for https://github.com/yarnpkg/berry/issues/2514:
  yarn set version from sources

  yarn config set pnpFallbackMode none
  yarn config set enableGlobalCache true
  yarn link --all --private -r "$nextDir"

  yarn build --no-lint
done
