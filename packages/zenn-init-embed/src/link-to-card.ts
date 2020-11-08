type Options = {
  cacheKey?: string
}

export default function linkToCard(options?: Options) {
  const targetLinks = document.querySelectorAll(".znc > p > a")
  targetLinks.forEach((linkElem)=>{
    const prevSibling = linkElem.previousSibling;
    const breaksBeforeLink = !prevSibling || prevSibling.textContent === "\n" // 直前の要素が存在しない or <br/>（= \n）の場合のみカード化する
    if(!breaksBeforeLink) return;

    const href = linkElem.getAttribute("href")
    const anchorText = linkElem.innerHTML.trim()
    const isHrefSameAsAnchor = href === anchorText
    if(!href || !href.startsWith("http") || !isHrefSameAsAnchor) return;

    const iframContainer = document.createElement("div");
    iframContainer.classList.add('embed-zenn-link');
    iframContainer.innerHTML = `<iframe src="https://asia-northeast1-zenn-dev-production.cloudfunctions.net/iframeLinkCard?url=${encodeURIComponent(href)}&key=${options?.cacheKey ? encodeURIComponent(options.cacheKey) : ''}" frameborder="0" scrolling="no"></iframe>`
    linkElem.parentElement?.insertBefore(iframContainer, linkElem);
  })
}