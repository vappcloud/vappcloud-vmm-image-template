import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const selections = {
  codex: { '@openai/codex': '0.164.0' },
  claude: { '@anthropic-ai/claude-code': '2.1.311' },
  both: { '@openai/codex': '0.164.0', '@anthropic-ai/claude-code': '2.1.311' },
};
for (const [preset, dependencies] of Object.entries(selections)) {
  test(`${preset}: self-contained live image and integrity-locked selection`, () => {
    const root = `vmm-images/ubuntu-ai-${preset}`;
    const spec = readFileSync(`${root}/image.toml`, 'utf8');
    assert.match(spec, /name = "ubuntu-vapp-desktop-live"/);
    assert.doesNotMatch(spec, /architecture\s*=/);
    assert.match(spec, /script = "scripts\/install-ai-agents.sh"/);
    const manifest = JSON.parse(readFileSync(`${root}/package.json`));
    const lock = JSON.parse(readFileSync(`${root}/package-lock.json`));
    assert.deepEqual(manifest.dependencies, dependencies);
    assert.deepEqual(lock.packages[''].dependencies, dependencies);
    for (const [path, entry] of Object.entries(lock.packages)) {
      if (!path) continue;
      assert.match(entry.resolved, /^https:\/\/registry\.npmjs\.org\//);
      assert.match(entry.integrity, /^sha512-[A-Za-z0-9+/]+=*$/);
    }
    for (const tool of Object.keys(dependencies)) {
      for (const arch of ['arm64', 'x64']) {
        const prefix = tool === '@openai/codex' ? `node_modules/@openai/codex-linux-${arch}` : `node_modules/${tool}-linux-${arch}`;
        assert.ok(lock.packages[prefix], `missing locked ${tool} ${arch}`);
      }
    }
    const script = readFileSync(`${root}/scripts/install-ai-agents.sh`, 'utf8');
    execFileSync('sh', ['-n', `${root}/scripts/install-ai-agents.sh`]);
    assert.match(script, /sha256sum --check --status/);
    assert.match(script, /dpkg --print-architecture/);
    assert.doesNotMatch(script, /uname|TARGET_ARCH/);
    assert.match(script, /--no-same-owner/);
    assert.match(script, /umask 022/);
    assert.match(script, /npm ci/);
    assert.match(script, /--ignore-scripts/);
    assert.match(script, /Unsupported AI image architecture/);
    assert.doesNotMatch(script, /\/home\/|API_KEY|auth\.json|credentials|:latest/);
    for (const [tool, binary] of [['@openai/codex', 'codex'], ['@anthropic-ai/claude-code', 'claude']]) {
      assert.equal(script.includes(`/usr/local/bin/${binary} --version`), tool in dependencies);
    }
  });
}
