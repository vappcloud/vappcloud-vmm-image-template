# VAppCloud VMM image template

This public repository is a minimal, reproducible build context for a custom
VAppCloud VMM image. It produces an Ubuntu desktop VMM with the VApp guest
contract, VSOCK, IMDS, a persistent root disk, and a small typed customization.

## Build from the Console

1. Open **VMM Images** and choose **Build image**.
2. Select **Public GitHub repository** as the build-context source.
3. Enter `https://github.com/vappcloud/vappcloud-vmm-image-template`.
4. Select a branch, tag, or commit. VAppCloud resolves it to an immutable commit
   before the build starts.
5. Leave **Context directory** empty because `image.toml` is at the repository
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

The Console/API importer accepts public `github.com` repositories only. It
rejects unsafe paths, links and special files, oversized archives, missing root
`image.toml`, and invalid refs. Shell provisioners require explicit opt-in.

Licensed under the Mozilla Public License 2.0.
