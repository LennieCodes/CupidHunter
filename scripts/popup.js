'use strict';

var bg = chrome.extension.getBackgroundPage();

$('#crawl').click(function() {
    if (!bg.cupid.isCrawling) {
        $('#crawl').prop('disabled', true)
        $('#crawl').text('Crawling...');

        bg.cupid.isCrawling = true;
        bg.cupid.initCrawl = true;
        bg.cupid.crawlLimit = $('#crawlLimit').val();

        chrome.tabs.create({url:'http://www.okcupid.com/home', active:false}, function(tab) {
            bg.cupid.tabId = tab.id;
        });

    }
});