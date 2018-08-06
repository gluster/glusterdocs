(function () {
  'use strict';

  $(document).ready(function () {
    fixSearchResults();
    fixSearch();
    warnDomain();
  });

  /**
   * Adds a TOC-style table to each page in the 'Modules' section.
   */
  function fixSearchResults() {
    $('#mkdocs-search-results').text('Searching...');
  }

  /**
   * Warn if the domain is gluster.readthedocs.io
   *
   */
  function warnDomain() {
    var domain = window.location.hostname;
    if (domain.indexOf('readthedocs.io') != -1) {
      $('div.section').prepend('<div class="warning"><p>You are viewing outdated content. We have moved to <a href="http://docs.gluster.org' + window.location.pathname + '">docs.gluster.org.</a></p></div>');
    }
  }

  /*
   * RTD messes up MkDocs' search feature by tinkering with the search box defined in the theme, see
   * https://github.com/rtfd/readthedocs.org/issues/1088. This function sets up a DOM4 MutationObserver
   * to react to changes to the search form (triggered by RTD on doc ready). It then reverts everything
   * the RTD JS code modified.
   */
  function fixSearch() {
    var target = document.getElementById('mkdocs-search-form');
    var config = {attributes: true, childList: true};

    var observer = new MutationObserver(function(mutations) {
      // if it isn't disconnected it'll loop infinitely because the observed element is modified
      observer.disconnect();
      var form = $('#mkdocs-search-form');
      form.empty();
      form.attr('action', 'https://' + window.location.hostname + '/en/' + determineSelectedBranch() + '/search.html');
      $('<input>').attr({
        type: "text",
        name: "q",
        placeholder: "Search docs"
      }).appendTo(form);
    });

    if (window.location.origin.indexOf('readthedocs') > -1 || window.location.origin.indexOf('docs.gluster.org') > -1) {
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
    var branch = 'latest', path = window.location.pathname;
    if (window.location.origin.indexOf('readthedocs') > -1) {
      // path is like /en/<branch>/<lang>/build/ -> extract 'lang'
      // split[0] is an '' because the path starts with the separator
      branch = path.split('/')[2];
    }
    return branch;
  }

}());
