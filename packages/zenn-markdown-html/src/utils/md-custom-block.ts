import MarkdownIt from 'markdown-it';
import { generateEmbedHTML, isEmbedType } from './embed-helper';

// Forked from: https://github.com/posva/markdown-it-custom-block
export function mdCustomBlock(md: MarkdownIt) {
  md.renderer.rules.custom = function tokenizeBlock(tokens, idx) {
    const { tag, arg }: any = tokens[idx].info; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (!isEmbedType(tag)) return '';
    if (typeof arg !== 'string') return '';

    try {
      return generateEmbedHTML(tag, arg) + '\n';
    } catch (e) {
      return '';
    }
  };

  md.block.ruler.before(
    'fence',
    'custom',
    function customEmbed(state, startLine, endLine, silent) {
      const startPos = state.bMarks[startLine] + state.tShift[startLine];
      const maxPos = state.eMarks[startLine];
      const block = state.src.slice(startPos, maxPos);
      const pointer = { line: startLine, pos: startPos };

      // Note: skip prev line break check
      // if (startLine !== 0) {
      //   let prevLineStartPos =
      //     state.bMarks[startLine - 1] + state.tShift[startLine - 1];
      //   let prevLineMaxPos = state.eMarks[startLine - 1];
      //   if (prevLineMaxPos > prevLineStartPos) return false;
      // }

      // Check if it's @[tag](arg)
      if (
        state.src.charCodeAt(pointer.pos) !== 0x40 /* @ */ ||
        state.src.charCodeAt(pointer.pos + 1) !== 0x5b /* [ */
      ) {
        return false;
      }

      const embedRE = /@\[([\w-]+)\]\((.+)\)/im;
      const match = embedRE.exec(block);

      if (!match || match.length < 3) {
        return false;
      }

      const [all, tag, arg] = match;

      pointer.pos += all.length;

      // Note: skip nextline break check
      // if (endLine !== pointer.line + 1) {
      //   let nextLineStartPos =
      //     state.bMarks[pointer.line + 1] + state.tShift[pointer.line + 1];
      //   let nextLineMaxPos = state.eMarks[pointer.line + 1];
      //   if (nextLineMaxPos > nextLineStartPos) return false;
      // }

      if (pointer.line >= endLine) return false;
      if (!silent) {
        const token = state.push('custom', 'div', 0);
        token.markup = state.src.slice(startPos, pointer.pos);
        // eslint-disable-next-line
        token.info = { arg, tag } as any;
        token.block = true;
        token.map = [startLine, pointer.line + 1];
        state.line = pointer.line + 1;
      }

      return true;
    },
    { alt: ['paragraph', 'reference', 'blockquote', 'list'] }
  );
}
