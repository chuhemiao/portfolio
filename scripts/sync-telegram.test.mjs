import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { parsePreview, jpegSize } = createRequire(import.meta.url)('./sync-telegram.js');

const message = (id, body, extra = '') => `<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message" data-post="kkdemian2050/${id}">${extra}<div class="tgme_widget_message_text js-message_text" dir="auto">${body}</div><time datetime="2026-11-06T06:49:34+00:00" class="time">06:49</time></div></div>`;

test('preview markup becomes the stored text form', () => {
  const [post] = parsePreview(
    message(
      158,
      '第一行<br/>看 <a href="https://www.coatue.com/fantastic-40" target="_blank">coatue </a>的组合 <a href="http://sound.xyz/" target="_blank">sound.xyz</a> <a href="https://x.com/a" target="_blank">https://x.com/a</a> <i class="emoji"><b>😂</b></i> A &amp; B',
      `<a class="tgme_widget_message_photo_wrap 1 2" href="https://t.me/kkdemian2050/158" style="width:800px;background-image:url('https://cdn1.telesco.pe/file/abc.jpg')"></a>`
    )
  );
  assert.equal(post.id, '158');
  assert.equal(post.date, '2026-11-06T06:49:34+00:00');
  assert.equal(post.text, '第一行\n看 [coatue](https://www.coatue.com/fantastic-40) 的组合 sound.xyz https://x.com/a 😂 A & B');
  assert.deepEqual(post.photos, ['https://cdn1.telesco.pe/file/abc.jpg']);
});

test('a photo with no caption parses with empty text', () => {
  const [post] = parsePreview(message(154, '').replace(/<div class="tgme_widget_message_text[\s\S]*?<\/div>/, ''));
  assert.equal(post.text, '');
});

test('jpegSize reads the frame header', () => {
  const sof = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x03, 0x20, 0x02, 0x4b, 0x03, 0, 0, 0, 0]);
  assert.deepEqual(jpegSize(sof), { height: 800, width: 587 });
  assert.equal(jpegSize(Buffer.from('not an image')), null);
});
