import { formatJson, tryParseJson } from '../../../../src/app/coding-labs/utils/coding-labs-form.utils';
describe('JSON authoring', () => {
  for (const value of [null, false, 0, 'hello', [1, 2], { a: 1 }]) {
    it('round trips ' + JSON.stringify(value), () => {
      expect(tryParseJson(formatJson(value))).toEqual({
        ok: true,
        parsed: value,
      });
    });
  }
  it('rejects empty and malformed JSON', () => {
    expect(tryParseJson('')).toEqual({ ok: false });
    expect(tryParseJson('{ broken')).toEqual({ ok: false });
  });
});
