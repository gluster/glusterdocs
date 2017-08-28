(function () {
  'use strict';

  $(document).ready(function () {
    addToc();
    fixSearch();
  });

  /**
   * Adds a TOC-style table to each page in the 'Modules' section.
   */
  function addToc() {
    var func, intro, tocHtmlTable;
    if (isModulePage()) {
      tocHtmlTable = '<table class="docutils">';
      $('h2').each(function (index) {
        // 'slice' cuts off the single permalink character at the end of the text (e.g. '¶')
        func = $(this).text().slice(0, -1);
        // get the first sentence of the paragraph directly below h2
        intro = $(this).next().text();
        intro = intro.substring(0, intro.indexOf('.') + 1);
        tocHtmlTable += createTocTableRow(func, intro);
      });
      tocHtmlTable += '</table>';
      $(tocHtmlTable).insertBefore($('h2').first())
    }
    function isModulePage() {
      // if the breadcrumb contains 'Modules »' it must be an API page
      return $("ul.wy-breadcrumbs li:contains('Modules »')").size() > 0;
    }
    function createTocTableRow(func, intro) {
      // fragile attempt to auto-create the in-page anchor
      var href = func.replace(/\.|:/g, '').replace('()', '').replace(' --', '-').replace(/ /g, '-');
      var link = '<a href="#' + href.toLowerCase() + '">' + func + '</a>';
      return '<tr><td>' + link + '</td><td>' + intro + '</td></tr>';
    }
  }

  /*
   * RTD messes up MkDocs' search feature by tinkering with the search box defined in the theme, see
   * https://github.com/rtfd/readthedocs.org/issues/1088. This function sets up a DOM4 MutationObserver
   * to react to changes to the search form (triggered by RTD on doc ready). It then reverts everything
   * the RTD JS code modified.
   */
  function fixSearch() {
    var target = document.getElementById('rtd-search-form');
    var config = {attributes: true, childList: true};

    var observer = new MutationObserver(function(mutations) {
      // if it isn't disconnected it'll loop infinitely because the observed element is modified
      observer.disconnect();
      var form = $('#rtd-search-form');
      form.empty();
      form.attr('action', 'https://' + window.location.hostname + '/en/' + determineSelectedBranch() + '/search.html');
      $('<input>').attr({
        type: "text",
        name: "q",
        placeholder: "Search docs"
      }).appendTo(form);
    });

    if (window.location.origin.indexOf('readthedocs') > -1) {
      observer.observe(target, config);
    }
  }


  /**
   * Analyzes the URL of the current page to find out what the selected GitHub branch is. It's usually
   * part of the location path. The code needs to distinguish between running MkDocs standalone
   * and docs served from RTD. If no valid branch could be determined 'dev' returned.
   *
   * @returns GitHub branch name
   */
  function determineSelectedBranch() {
    var branch = 'dev', path = window.location.pathname;
    if (window.location.origin.indexOf('readthedocs') > -1) {
      // path is like /en/<branch>/<lang>/build/ -> extract 'lang'
      // split[0] is an '' because the path starts with the separator
      branch = path.split('/')[2];
    }
    return branch;
  }

}());
