# VISDA Website — Safe FTP Deployment Runbook

Prepared because this Claude Code sandbox cannot reach the FTP server
(port 21) or SSH/SFTP (port 22) — both are firewalled at the network
level from this cloud environment; only HTTPS (443) egress is allowed.
Run this runbook from a machine/session that DOES have normal outbound
network access (your own computer, or a locally-run Claude Code CLI
session).

## Pre-flight audit (already done, results below)

- 10 HTML pages, `assets/css/style.css`, `assets/js/main.js`,
  `images/dr-premkumar-v.png`. Total size: 336 KB.
- Every internal `href=`/`src=` reference was checked programmatically:
  **zero broken links, zero missing assets** (one path inside an HTML
  `<!-- comment -->` in gallery.html is just example text, not a live link).
- All 10 pages link to and from each other (header nav + footer) —
  **no orphan pages**.
- **No filename collisions with WordPress core**: none of these files are
  named `index.php`, `wp-login.php`, `wp-config.php`, `wp-admin`,
  `wp-content`, `wp-includes`, or `xmlrpc.php`. The only overlap to be
  aware of is the folder names `assets/` and `images/` — **before
  uploading, check whether these already exist at the WordPress root**
  (Step 2). If they do and contain unrelated files, upload into new
  folder names instead (e.g. `assets-visda/`, `images-visda/`) and
  update the `href="assets/..."` / `src="images/..."` paths in the HTML
  accordingly.

## Step 1 — Back up first (non-negotiable)

Before changing anything on the live server:
```bash
# Full site backup via FTP (or use the host's backup tool if it has one)
lftp -u 'u471136946.visda.keerthanasv.com,YOUR_PASSWORD' ftp://217.21.91.80:21 \
  -e "mirror --parallel=4 / ./visda-backup-$(date +%Y%m%d); bye"
```
Also export the database from phpMyAdmin/hPanel if you have access — this
deployment does not touch the DB, but always have a restore point.

## Step 2 — Inspect the remote root BEFORE uploading anything

```bash
lftp -u 'u471136946.visda.keerthanasv.com,YOUR_PASSWORD' ftp://217.21.91.80:21 \
  -e "ls -la; bye"
```
Confirm:
- WordPress core is present (`wp-admin/`, `wp-content/`, `wp-includes/`,
  `wp-config.php`, `wp-login.php`, `.htaccess`, root `index.php`).
- Whether `assets/` or `images/` folders already exist at root. If yes,
  inspect their contents — do not blindly overwrite.
- Download the current `.htaccess` and keep a copy:
  ```bash
  lftp -u 'u471136946.visda.keerthanasv.com,YOUR_PASSWORD' ftp://217.21.91.80:21 \
    -e "get .htaccess -o htaccess-live-backup.txt; bye"
  ```

## Step 3 — Upload the new site files (additive only)

Upload every file from `website-31b44a6c-99ca-4509-be31-d200a4dc7bcd/`
into the WordPress **root** (the same directory as `wp-config.php`).
This is additive — it does NOT touch `wp-admin`, `wp-content`,
`wp-includes`, `wp-config.php`, plugins, themes, uploads, or the DB.

```bash
cd website-31b44a6c-99ca-4509-be31-d200a4dc7bcd
lftp -u 'u471136946.visda.keerthanasv.com,YOUR_PASSWORD' ftp://217.21.91.80:21 \
  -e "mirror --reverse --verbose \
      --exclude-glob wp-admin/ \
      --exclude-glob wp-content/ \
      --exclude-glob wp-includes/ \
      --exclude wp-config.php \
      --exclude .htaccess \
      --exclude wp-login.php \
      --exclude xmlrpc.php \
      . /; bye"
```
The `--exclude` flags are a safety net (in case any generated file ever
collides with those names) — this file set doesn't include any of them,
but keep the flags anyway.

## Step 4 — Route "/" to index.html without touching WordPress

Do NOT overwrite the live `.htaccess`. Instead:
1. Download the current `.htaccess` (done in Step 2).
2. Prepend the block from `htaccess-snippet.txt` (in this same folder)
   to the TOP of it — above the `# BEGIN WordPress` marker.
3. Upload the merged file back as `.htaccess`.

This makes `/` serve the new `index.html`, while `/wp-admin/`,
`/wp-login.php`, `/wp-json/*` (REST API), `/wp-admin/admin-ajax.php`
(AJAX, including Fluent Forms submissions), and all WordPress permalinks
continue to be handled by WordPress's own untouched rewrite rules.

## Step 5 — Test like a real visitor

- `https://visda.keerthanasv.com/` → new static homepage loads, with
  CSS/JS/images rendering (check browser devtools Network tab for 404s).
- Click through every header nav item, mobile menu, footer link, CTA
  button, and card on every page — confirm each lands on the correct
  page (10 pages total: index, about, services,
  robotic-knee-replacement, doctors, videos, gallery, contact,
  privacy-policy, terms-and-conditions).
- `https://visda.keerthanasv.com/wp-admin/` → WordPress admin login
  still loads normally.
- `https://visda.keerthanasv.com/wp-login.php` → loads normally.
- Log into wp-admin, confirm the dashboard, plugins list, and Fluent
  Forms list all still work.
- Open a page/post that embeds a Fluent Form (if any exist) and submit
  a test entry — confirm it's received in Fluent Forms → Entries.
- Check `https://visda.keerthanasv.com/wp-json/` returns JSON (REST API
  alive) and that any AJAX-dependent plugin features still function.

## Step 6 — Rollback plan (if anything breaks)

- Restore `.htaccess` from `htaccess-live-backup.txt` via FTP.
- Delete the uploaded static files (index.html, about.html, etc.,
  assets/, images/) if you need to fully revert the frontend —
  WordPress's own `index.php` will immediately resume serving `/` since
  DirectoryIndex falls back to it once index.html is gone.
