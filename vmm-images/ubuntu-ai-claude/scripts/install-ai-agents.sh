#!/bin/sh
# Reviewed image inputs only; no provider login, user HOME, or login material.
set -eu
umask 022
NODE_VERSION=22.23.5
case "$(dpkg --print-architecture)" in
  aarch64|arm64) node_arch=arm64; node_sha=2babb9eb5264860d540849f4b064a6fbdebcdc323657d9d382ce23d313fd5e09 ;;
  x86_64|amd64) node_arch=x64; node_sha=cdeb8670a0c81f51b4dc4ac61919f9b1ad917b304bf8221eb939570663d240f8 ;;
  *) echo "Unsupported AI image architecture" >&2; exit 1 ;;
esac
work_dir=$(mktemp -d)
trap 'rm -rf "$work_dir"' EXIT HUP INT TERM
archive="node-v${NODE_VERSION}-linux-${node_arch}.tar.xz"
curl --fail --silent --show-error --location --proto '=https' --tlsv1.2   "https://nodejs.org/dist/v${NODE_VERSION}/${archive}" -o "$work_dir/node.tar.xz"
printf '%s  %s\n' "$node_sha" "$work_dir/node.tar.xz" | sha256sum --check --status
tar -xJf "$work_dir/node.tar.xz" -C /usr/local --strip-components=1 --no-same-owner
export PATH=/usr/local/bin:/usr/bin:/bin
install -d -m 0755 /opt/vapp/ai-tools
test -s /opt/vapp/ai-tools/package.json
test -s /opt/vapp/ai-tools/package-lock.json
# Lockfile verifies every npm artifact. No lifecycle scripts or fallback downloads.
HOME="$work_dir/home" npm_config_cache="$work_dir/npm-cache" npm ci   --prefix /opt/vapp/ai-tools --ignore-scripts --omit=dev --no-audit --no-fund
install -d -m 0755 /etc/vapp
: > /etc/vapp/ai-workstation-versions
printf 'node=%s\n' "$NODE_VERSION" >> /etc/vapp/ai-workstation-versions
ln -sfn "/opt/vapp/ai-tools/node_modules/@anthropic-ai/claude-code-linux-${node_arch}/claude" /usr/local/bin/claude
HOME="$work_dir/home" /usr/local/bin/claude --version
printf 'claude=2.1.311\n' >> /etc/vapp/ai-workstation-versions
chmod 0644 /etc/vapp/ai-workstation-versions
