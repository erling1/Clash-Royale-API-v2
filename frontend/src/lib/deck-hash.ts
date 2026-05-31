/**
 * Reproduces the deck identity used by the data pipeline so the frontend can
 * look up any 8-card combo via the existing /decks endpoints without a new
 * backend route.
 *
 * dbt (deck_usages): md5(string_agg(card_id::varchar, '|' order by card_id)).
 * i.e. card ids sorted ascending, joined by '|', md5-hex. Verified to match
 * stored deck_hash values exactly. Web Crypto has no MD5, so md5() is bundled.
 */

function rotl(n: number, c: number): number {
  return (n << c) | (n >>> (32 - c));
}
function add(x: number, y: number): number {
  const l = (x & 0xffff) + (y & 0xffff);
  return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff);
}
function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
  return add(rotl(add(add(a, q), add(x, t)), s), b);
}
function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & c) | (~b & d), a, b, x, s, t);
}
function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & d) | (c & ~d), a, b, x, s, t);
}
function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}
function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(c ^ (b | ~d), a, b, x, s, t);
}

function toBlocks(s: string): number[] {
  const n = s.length;
  const blks: number[] = [];
  for (let i = 0; i < n * 8; i += 8) {
    blks[i >> 5] = (blks[i >> 5] || 0) | ((s.charCodeAt(i / 8) & 0xff) << (i % 32));
  }
  const idx = (n * 8) >> 5;
  blks[idx] = (blks[idx] || 0) | (0x80 << ((n * 8) % 32));
  const lenIdx = (((n + 8) >> 6) + 1) * 16 - 2;
  while (blks.length <= lenIdx) blks.push(0);
  blks[lenIdx] = n * 8;
  return blks;
}

/** MD5 hex digest of an ASCII string (sufficient for digit/'|' deck strings). */
export function md5(str: string): string {
  const x = toBlocks(str);
  let a = 1732584193,
    b = -271733879,
    c = -1732584194,
    d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const oa = a,
      ob = b,
      oc = c,
      od = d;
    a = ff(a, b, c, d, x[i] | 0, 7, -680876936);
    d = ff(d, a, b, c, x[i + 1] | 0, 12, -389564586);
    c = ff(c, d, a, b, x[i + 2] | 0, 17, 606105819);
    b = ff(b, c, d, a, x[i + 3] | 0, 22, -1044525330);
    a = ff(a, b, c, d, x[i + 4] | 0, 7, -176418897);
    d = ff(d, a, b, c, x[i + 5] | 0, 12, 1200080426);
    c = ff(c, d, a, b, x[i + 6] | 0, 17, -1473231341);
    b = ff(b, c, d, a, x[i + 7] | 0, 22, -45705983);
    a = ff(a, b, c, d, x[i + 8] | 0, 7, 1770035416);
    d = ff(d, a, b, c, x[i + 9] | 0, 12, -1958414417);
    c = ff(c, d, a, b, x[i + 10] | 0, 17, -42063);
    b = ff(b, c, d, a, x[i + 11] | 0, 22, -1990404162);
    a = ff(a, b, c, d, x[i + 12] | 0, 7, 1804603682);
    d = ff(d, a, b, c, x[i + 13] | 0, 12, -40341101);
    c = ff(c, d, a, b, x[i + 14] | 0, 17, -1502002290);
    b = ff(b, c, d, a, x[i + 15] | 0, 22, 1236535329);
    a = gg(a, b, c, d, x[i + 1] | 0, 5, -165796510);
    d = gg(d, a, b, c, x[i + 6] | 0, 9, -1069501632);
    c = gg(c, d, a, b, x[i + 11] | 0, 14, 643717713);
    b = gg(b, c, d, a, x[i] | 0, 20, -373897302);
    a = gg(a, b, c, d, x[i + 5] | 0, 5, -701558691);
    d = gg(d, a, b, c, x[i + 10] | 0, 9, 38016083);
    c = gg(c, d, a, b, x[i + 15] | 0, 14, -660478335);
    b = gg(b, c, d, a, x[i + 4] | 0, 20, -405537848);
    a = gg(a, b, c, d, x[i + 9] | 0, 5, 568446438);
    d = gg(d, a, b, c, x[i + 14] | 0, 9, -1019803690);
    c = gg(c, d, a, b, x[i + 3] | 0, 14, -187363961);
    b = gg(b, c, d, a, x[i + 8] | 0, 20, 1163531501);
    a = gg(a, b, c, d, x[i + 13] | 0, 5, -1444681467);
    d = gg(d, a, b, c, x[i + 2] | 0, 9, -51403784);
    c = gg(c, d, a, b, x[i + 7] | 0, 14, 1735328473);
    b = gg(b, c, d, a, x[i + 12] | 0, 20, -1926607734);
    a = hh(a, b, c, d, x[i + 5] | 0, 4, -378558);
    d = hh(d, a, b, c, x[i + 8] | 0, 11, -2022574463);
    c = hh(c, d, a, b, x[i + 11] | 0, 16, 1839030562);
    b = hh(b, c, d, a, x[i + 14] | 0, 23, -35309556);
    a = hh(a, b, c, d, x[i + 1] | 0, 4, -1530992060);
    d = hh(d, a, b, c, x[i + 4] | 0, 11, 1272893353);
    c = hh(c, d, a, b, x[i + 7] | 0, 16, -155497632);
    b = hh(b, c, d, a, x[i + 10] | 0, 23, -1094730640);
    a = hh(a, b, c, d, x[i + 13] | 0, 4, 681279174);
    d = hh(d, a, b, c, x[i] | 0, 11, -358537222);
    c = hh(c, d, a, b, x[i + 3] | 0, 16, -722521979);
    b = hh(b, c, d, a, x[i + 6] | 0, 23, 76029189);
    a = hh(a, b, c, d, x[i + 9] | 0, 4, -640364487);
    d = hh(d, a, b, c, x[i + 12] | 0, 11, -421815835);
    c = hh(c, d, a, b, x[i + 15] | 0, 16, 530742520);
    b = hh(b, c, d, a, x[i + 2] | 0, 23, -995338651);
    a = ii(a, b, c, d, x[i] | 0, 6, -198630844);
    d = ii(d, a, b, c, x[i + 7] | 0, 10, 1126891415);
    c = ii(c, d, a, b, x[i + 14] | 0, 15, -1416354905);
    b = ii(b, c, d, a, x[i + 5] | 0, 21, -57434055);
    a = ii(a, b, c, d, x[i + 12] | 0, 6, 1700485571);
    d = ii(d, a, b, c, x[i + 3] | 0, 10, -1894986606);
    c = ii(c, d, a, b, x[i + 10] | 0, 15, -1051523);
    b = ii(b, c, d, a, x[i + 1] | 0, 21, -2054922799);
    a = ii(a, b, c, d, x[i + 8] | 0, 6, 1873313359);
    d = ii(d, a, b, c, x[i + 15] | 0, 10, -30611744);
    c = ii(c, d, a, b, x[i + 6] | 0, 15, -1560198380);
    b = ii(b, c, d, a, x[i + 13] | 0, 21, 1309151649);
    a = ii(a, b, c, d, x[i + 4] | 0, 6, -145523070);
    d = ii(d, a, b, c, x[i + 11] | 0, 10, -1120210379);
    c = ii(c, d, a, b, x[i + 2] | 0, 15, 718787259);
    b = ii(b, c, d, a, x[i + 9] | 0, 21, -343485551);
    a = add(a, oa);
    b = add(b, ob);
    c = add(c, oc);
    d = add(d, od);
  }
  const hex = (n: number): string => {
    let s = "";
    for (let i = 0; i < 4; i++) s += ((n >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    return s;
  };
  return hex(a) + hex(b) + hex(c) + hex(d);
}

/** Deck identity hash for a set of card ids (order-independent). */
export function deckHash(cardIds: number[]): string {
  const sorted = [...cardIds].sort((a, b) => a - b);
  return md5(sorted.join("|"));
}
