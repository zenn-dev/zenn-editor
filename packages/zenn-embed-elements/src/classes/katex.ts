import katex from 'katex';
import 'katex/dist/katex.min.css';

const containerId = 'katex-container';

export class EmbedKatex extends HTMLElement {
  private _container: HTMLDivElement;

  constructor() {
    super();
    const container = document.createElement('div');
    container.setAttribute('id', containerId);
    this._container = container;
  }

  async connectedCallback() {
    this.render();
  }

  async render() {
    const displayMode = !!this.getAttribute('display-mode');

    // detailsタグの中ではinnerTextがnullになることがあるため
    const content = this.textContent || this.innerText;
    katex.render(content, this._container, {
      macros: { '\\RR': '\\mathbb{R}' },
      throwOnError: false,
      displayMode,
    });
    this.innerHTML = this._container.innerHTML;
  }
}

/**
 * @module https://github.com/KaTeX/KaTeX
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2020 Khan Academy and other contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
