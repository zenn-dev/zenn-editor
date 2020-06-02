const youtubeRegex = /\[youtube:[ ]*([a-zA-Z0-9_\-]+)[ ]*\]/;
const youtubeReplace =
  '<div class="embed-youtube"><iframe src="https://www.youtube.com/embed/$1" allowfullscreen></iframe></div>';

export const loadEmbed = (html: string) => {
  if (youtubeRegex.test(html)) {
    '<iframe width="420" height="345" src="//player.vimeo.com/video/$1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';

    var html = html.replace(pattern1, replacement);
  }
  // var regexVimeo = /(?:<http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;
  // var regexYoutube = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;

  // var videoEmbed = {
  //   invoke: function () {
  //     $("body").html(function (i, html) {
  //       return videoEmbed.convertMedia(html);
  //     });
  //   },
  //   convertMedia: function (html) {
  //     var pattern1 = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(.+)/g;
  //     var pattern2 = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/g;
  //     var pattern3 = /([-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?(?:jpg|jpeg|gif|png))/gi;

  //     if (pattern1.test(html)) {
  //       var replacement =
  //         '<iframe width="420" height="345" src="//player.vimeo.com/video/$1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';

  //       var html = html.replace(pattern1, replacement);
  //     }

  //     if (pattern2.test(html)) {
  //       var replacement =
  //         '<iframe width="420" height="345" src="http://www.youtube.com/embed/$1" frameborder="0" allowfullscreen></iframe>';
  //       var html = html.replace(pattern2, replacement);
  //     }

  //     if (pattern3.test(html)) {
  //       var replacement =
  //         '<a href="$1" target="_blank"><img class="sml" src="$1" /></a><br />';
  //       var html = html.replace(pattern3, replacement);
  //     }
  //     return html;
  //   },
  // };
};
