# VAppCloud VMM image template

This public repository is a minimal, reproducible build context for a custom
VAppCloud VMM image. It produces an Ubuntu desktop VMM with the VApp guest
contract, VSOCK, IMDS, a persistent root disk, and a small typed customization.

## Build from the Console

1. Open **VMM Images** and choose **Build image**.
2. Select **GitHub repository** as the build-context source.
3. Enter `https://github.com/vappcloud/vappcloud-vmm-image-template`.
4. For a private repository, select your existing GitHub provider connection.
   Public repositories do not require a provider connection.
5. Select a branch, tag, or commit. VAppCloud resolves it to an immutable commit
   before the build starts.
6. Leave **Context directory** empty because `image.toml` is at the repository
   root, select a running build device, and start the build.

The example uses only typed provisioners, so **Allow shell provisioners** can
remain disabled.

## Customize

- Change `[profile]` in `image.toml` to another supported VApp profile.
- Add distribution packages with typed `apt`, `dnf`, or `apk` provisioners.
- Add files under `assets/` and reference them with `content_file`.
- Use `.vappignore` to keep documentation and development files out of the
  uploaded build context.

Each build records the canonical repository URL, requested ref, resolved commit
SHA, context directory, and normalized context digest. Subsequent builds of the
same commit therefore have auditable source provenance.

## Safety contract

The Console/API importer accepts public `github.com` repositories and private
repositories authorized through an account-owned GitHub provider connection.
It rejects unsafe paths, links and special files, oversized archives, missing
root `image.toml`, invalid refs, and provider connections owned by another
account. Shell provisioners require explicit opt-in.

Licensed under the Mozilla Public License 2.0.

## AI Studio live image presets

The root example remains a minimal installed-root desktop. For a default VMM OS
switch with AI tools preinstalled, choose one of these separate live contexts:

| Context directory | Commands |
| --- | --- |
| `vmm-images/ubuntu-ai-codex` | Codex 0.164.0 |
| `vmm-images/ubuntu-ai-claude` | Claude Code 2.1.311 |
| `vmm-images/ubuntu-ai-both` | Both |

Use this public repository and an immutable reviewed commit, select your build
device's `aarch64` or `x86_64` architecture, and enable **Allow shell provisioners**.
No GitHub provider connection is needed. Each context contains its complete
`image.toml`, package manifest, integrity lockfile, and installer. The
`ubuntu-vapp-desktop-live` profile preserves the default guest's live/data layout;
these packages do not change the minimal GUI-only base template.

Node 22.23.5 uses official SHA256-pinned archives. CLI dependencies are version
and integrity locked; npm lifecycle scripts are disabled. Selected commands are
installed under `/usr/local/bin` and checked with `--version` during the build.
The target Ubuntu architecture comes from its dpkg database; extracted Node files
remain root-owned. Versions are recorded in `/etc/vapp/ai-workstation-versions`.
No provider credentials or user HOME are included. Authenticate after boot;
retained credentials and HOME belong to the VMM, not an individual project.

Validate the presets without installing dependencies:

```sh
node --test test/ai-image-presets.test.mjs
```

The CLI packages retain their respective vendor licenses. This repository
contains installation inputs, not copies of the downloaded vendor binaries.
