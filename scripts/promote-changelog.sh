#!/usr/bin/env bash
# CHANGELOG.md の [Unreleased] セクションを、これからリリースするバージョンに昇格させる。
# `npm version` の `version` ライフサイクルフックから呼ばれることを想定。
#
# - $npm_package_version は npm version 実行中に自動で渡される
# - [Unreleased] 見出しはそのまま残し、その直下に新しいバージョン見出しを差し込む
# - 結果として、[Unreleased] の本文だった内容が新バージョンに移り、[Unreleased] は空になる
# - 末尾の参照リンクも追従して書き換える

set -euo pipefail

VERSION="${npm_package_version:-}"
if [ -z "$VERSION" ]; then
  echo "[promote-changelog] \$npm_package_version が未設定です。npm version 経由で実行してください。" >&2
  exit 1
fi

if [ ! -f CHANGELOG.md ]; then
  echo "[promote-changelog] CHANGELOG.md が見つかりません。" >&2
  exit 1
fi

DATE=$(date +%Y-%m-%d)

# リポジトリ URL を package.json から拾って、参照リンクの差し替えにも使う
REPO_URL=$(node -e "const p=require('./package.json'); const u=(p.repository&&p.repository.url)||''; process.stdout.write(u.replace(/^git\+/, '').replace(/\.git$/, ''))")

awk -v v="$VERSION" -v d="$DATE" -v repo="$REPO_URL" '
  # 見出し: [Unreleased] のすぐ下に新バージョン見出しを差し込む
  /^## \[Unreleased\]/ && !heading_done {
    print "## [Unreleased]"
    print ""
    print "## [" v "] - " d
    heading_done = 1
    next
  }

  # 参照リンク: [Unreleased] の compare URL を新バージョン基準に更新し、
  # その直前に新バージョンへのタグリンクを追加
  /^\[Unreleased\]:/ && !link_done && repo != "" {
    print "[Unreleased]: " repo "/compare/v" v "...HEAD"
    print "[" v "]: " repo "/releases/tag/v" v
    link_done = 1
    next
  }

  { print }

  END {
    if (!heading_done) {
      print "[promote-changelog] 警告: [Unreleased] 見出しが見つかりませんでした" > "/dev/stderr"
    }
  }
' CHANGELOG.md > CHANGELOG.md.tmp

mv CHANGELOG.md.tmp CHANGELOG.md

echo "[promote-changelog] CHANGELOG.md を v${VERSION} (${DATE}) に昇格しました"
