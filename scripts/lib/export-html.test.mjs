import test from 'node:test';
import assert from 'node:assert/strict';
import { countInitialHeaderLanguageMenus } from './export-html.mjs';

const menu = '<select aria-label="网站语言"><option>中文</option></select>';
const verify = html => assert.equal(countInitialHeaderLanguageMenus(html), 1);
test('one initial header menu plus a hidden streamed replacement is not a duplicate visible menu', () => {
  assert.doesNotThrow(() => verify(`<header><!--$?--><template id="B:0"></template>${menu}<!--/$--></header><main>Readable resources</main><div hidden id="S:0">${menu}</div>`));
});
test('two real menus inside the header remain rejected, and a missing header never passes', () => {
  assert.throws(() => verify(`<header>${menu}${menu}</header>`), { code: 'ERR_ASSERTION' });
  assert.throws(() => verify(`<main>${menu}</main>`), { code: 'ERR_ASSERTION' });
});
