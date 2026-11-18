/** Original vector artwork. Run with `node scripts/generate-gems.mjs`. No external assets. */
import { mkdirSync, writeFileSync } from 'node:fs'
const colors = {
  2: ['#ffffff', '#e9e8f3', '#bbb8d0', '#84829f'],
  4: ['#fff1f7', '#f2b8d2', '#d579a5', '#934a7b'],
  8: ['#f4dcff', '#bd8de8', '#8852bd', '#59337f'],
  16: ['#e2fcff', '#8cdbe9', '#45a7c1', '#28728f'],
  32: ['#f2f9c1', '#c0d57c', '#829e37', '#4d6528'],
  64: ['#fff4c6', '#f4ce67', '#d6a037', '#92601e'],
  128: ['#f9bbce', '#bf4f70', '#8b2348', '#55132d'],
  256: ['#d2ddff', '#7899ed', '#3655b9', '#1b2f78'],
  512: ['#ffb5cb', '#ee668b', '#c22450', '#7c1236'],
  1024: ['#c3ffe0', '#69cfac', '#229576', '#126147'],
  2048: ['#fffaff', '#d4ecf4', '#b8aed7', '#8c9abe'],
}
mkdirSync(new URL('../src/assets/gems/', import.meta.url), { recursive: true })
for (const [value, [light, mid, dark, deep]] of Object.entries(colors)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <defs>
    <linearGradient id="body" x1="25" y1="10" x2="90" y2="112" gradientUnits="userSpaceOnUse"><stop stop-color="${light}"/><stop offset=".4" stop-color="${mid}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
    <linearGradient id="table" x1="43" y1="28" x2="83" y2="85" gradientUnits="userSpaceOnUse"><stop stop-color="${light}"/><stop offset=".55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>
    <linearGradient id="shine" x1="30" y1="18" x2="90" y2="95" gradientUnits="userSpaceOnUse"><stop stop-color="white" stop-opacity=".9"/><stop offset=".5" stop-color="white" stop-opacity=".12"/><stop offset="1" stop-color="white" stop-opacity=".45"/></linearGradient>
    ${value === '2048' ? '<linearGradient id="rainbow" x1="18" y1="20" x2="100" y2="100"><stop stop-color="#ffe7f4"/><stop offset=".35" stop-color="#d5f7ff"/><stop offset=".65" stop-color="#efe1ff"/><stop offset="1" stop-color="#fff3ce"/></linearGradient>' : ''}
  </defs>
  <path d="M38 9 82 9 110 37 110 81 82 109 38 109 10 81 10 37Z" fill="url(#body)" stroke="${deep}" stroke-opacity=".28" stroke-width="1.2"/>
  <path d="M38 9 47 30 30 47 10 37Z" fill="${light}"/><path d="M38 9 82 9 73 30 47 30Z" fill="${mid}"/>
  <path d="M82 9 110 37 90 47 73 30Z" fill="${light}"/><path d="M110 37 110 81 90 73 90 47Z" fill="${dark}"/>
  <path d="M110 81 82 109 73 90 90 73Z" fill="${mid}"/><path d="M82 109 38 109 47 90 73 90Z" fill="${deep}"/>
  <path d="M38 109 10 81 30 73 47 90Z" fill="${dark}"/><path d="M10 81 10 37 30 47 30 73Z" fill="${mid}"/>
  <path d="M38 9 60 19 47 30Z M82 9 101 40 73 30Z M110 81 84 94 90 73Z M38 109 20 78 47 90Z" fill="white" fill-opacity=".42"/>
  <path d="M10 37 21 60 30 47Z M110 37 99 60 90 47Z M82 109 60 100 73 90Z" fill="${deep}" fill-opacity=".35"/>
  <path d="M47 30 73 30 90 47 90 73 73 90 47 90 30 73 30 47Z" fill="${value === '2048' ? 'url(#rainbow)' : 'url(#table)'}" stroke="white" stroke-opacity=".6" stroke-width=".7"/>
  <path d="M47 30 73 30 90 47 30 73 30 47Z" fill="white" fill-opacity=".16"/>
  <path d="M47 30 73 30 90 47 90 73 73 90 47 90 30 73 30 47Z M38 9 82 9 110 37 110 81 82 109 38 109 10 81 10 37Z" stroke="url(#shine)" stroke-width="1.4"/>
  <path d="M39 10 47 30 M81 10 73 30 M109 38 90 47 M109 80 90 73 M81 108 73 90 M39 108 47 90 M11 80 30 73 M11 38 30 47" stroke="white" stroke-opacity=".45" stroke-width=".8"/>
  <path d="m33 19 2.4 7.1L43 29l-7.6 2.4L33 39l-2.3-7.6L23 29l7.7-2.9Z" fill="white" fill-opacity=".95"/>
  <path d="m89 77 1.5 4.5L95 83l-4.5 1.5L89 89l-1.5-4.5L83 83l4.5-1.5Z" fill="white" fill-opacity=".8"/>
</svg>`
  writeFileSync(new URL(`../src/assets/gems/${value}.svg`, import.meta.url), svg)
}
writeFileSync(
  new URL('../public/favicon.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#f8f5ef"/><path d="m16 17 32 0 10 13-26 23L6 30Z" fill="#d5bb82" stroke="#a4874c"/><path d="m16 17 8 13 8-13 8 13 8-13M6 30h52M24 30l8 23 8-23" fill="none" stroke="#fff8e6" stroke-width="1.5"/></svg>`,
)
