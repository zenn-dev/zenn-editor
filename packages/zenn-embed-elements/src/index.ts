import { EmbedGist } from './classes/gist';
import { EmbedTweet } from './classes/tweet';
import { EmbedKatex } from './classes/katex';

customElements.define('embed-gist', EmbedGist);
customElements.define('embed-tweet', EmbedTweet);
customElements.define('embed-katex', EmbedKatex);
