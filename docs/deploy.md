# Deployment

Live URL:

https://baditaflorin.github.io/bilateral-memory-processing/

Repository:

https://github.com/baditaflorin/bilateral-memory-processing

## Publishing

GitHub Pages is configured to serve `main` branch `/docs`.

Manual publish:

```sh
npm install
make build
git add docs package-lock.json
git commit -m "chore: publish pages build"
git push
```

## Rollback

Revert the publishing commit and push:

```sh
git revert <commit_sha>
git push
```

## Custom Domain

No custom domain is configured in v1. To add one, create `docs/CNAME`, configure DNS with the provider, and update ADR 0010.

## GitHub Pages Notes

GitHub Pages does not support `_headers` or `_redirects`. SPA fallback is provided by copying `docs/index.html` to `docs/404.html` during build.
