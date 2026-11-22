const ITEMS = [
  "forme-foundation",
  "button",
  "badge",
  "card",
  "tooltip",
  "tabs",
  "command-menu",
  "segmented-control",
  "kbd",
  "separator",
];

const ROOT = "https://formeui.com/r";
const written = new Set();

for (const item of ITEMS) {
  const data = await (await fetch(`${ROOT}/${item}.json`)).json();
  for (const file of data.files) {
    const target = file.target.replace(/^@components\//, "src/components/");
    if (written.has(target)) continue;
    await Bun.write(target, file.content);
    written.add(target);
    console.log(`wrote ${target}`);
  }
  if (data.dependencies?.length) {
    console.log(`${item} deps: ${data.dependencies.join(" ")}`);
  }
}
