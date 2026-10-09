git push --tags
npm run build

COMMENT="$1"
VERSION="$2"

if [ -z "${COMMENT}" ]; then
  echo "コミットコメントは必須です。コミットを省略する場合「-」を指定してください"
  exit 1
fi

if [ "${COMMENT}" != "-" ]; then
  git add -A
  git commit -m "${COMMENT}"
  git push
fi

case "${VERSION}" in
  "major")
    npm version major ;;
  "minor")
    npm version minor ;;
  *)
    npm version patch ;;
esac

git push --follow-tags

npm publish
