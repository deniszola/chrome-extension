// Query the tabs
const tabs = await chrome.tabs.query({
  url: [
    'https://developer.chrome.com/docs/webstore/*',
    'https://developer.chrome.com/docs/extensions/*',
  ],
});

// Focus on a tab
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById('li_template');
const elements = new Set();
for (const tab of tabs) {
  const element = template.content.firstElementChild.cloneNode(true);

  const title = tab.title.split('-')[0].trim();
  const pathname = new URL(tab.url).pathname.slice('/docs'.length);

  element.querySelector('.title').textContent = title;
  element.querySelector('.pathname').textContent = pathname;
  element.querySelector('a').addEventListener('click', async () => {
    // need to focus window as well as the active tab
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  });

  elements.add(element);
}
document.querySelector('ul').append(...elements);

// Group and ungroup the tabs
const button = document.querySelector('button');
let state = false;
button.addEventListener('click', async () => {
  const tabIds = tabs.map(({ id }) => id);

  if (!state) {
    const group = await chrome.tabs.group({ tabIds });
    state = true;
    button.textContent = 'Ungroup Tabs';
    await chrome.tabGroups.update(group, { title: 'DOCS', color: 'blue' });
  } else {
    await chrome.tabs.ungroup(tabIds);
    state = false;
    button.textContent = 'Group Tabs';
  }
});
