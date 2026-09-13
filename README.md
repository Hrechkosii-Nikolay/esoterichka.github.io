# esoterichka.github.io

Static website for esoterichka.com.ua.

## Structure

- `*.html` - site pages.
- `css/` - production CSS used by pages.
- `sass/` - source Sass/CSS files for styles.
- `js/` - frontend scripts for menus, forms, masks, sliders, and UI behavior.
- `img/` - images and icons.
- `fonts/` - local font files.
- `telegram.php` - form handler that sends requests to Telegram.

## Notes

- Do not commit `.DS_Store` or other local OS/editor files.
- Keep form field names in HTML aligned with `telegram.php`.
- If styles are changed in Sass, update the production CSS that pages load from `css/`.
