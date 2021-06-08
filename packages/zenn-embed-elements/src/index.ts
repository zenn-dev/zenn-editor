import { EmbedGist } from './classes/gist';
import { EmbedTweet } from './classes/tweet';
import { EmbedKatex } from './classes/katex';
import { EmbedMermaid } from './classes/mermaid';

customElements.define('embed-gist', EmbedGist);
customElements.define('embed-tweet', EmbedTweet);
customElements.define('embed-katex', EmbedKatex);
customElements.define('embed-mermaid', EmbedMermaid);
