import { EmbedKatex } from './classes/katex';
import { initFootnoteTooltip } from './classes/footnote-tooltip';

customElements.define('embed-katex', EmbedKatex);
initFootnoteTooltip();
