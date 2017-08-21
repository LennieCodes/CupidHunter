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
        
        // debug
        // chrome.tabs.create({url:'http://www.okcupid.com/profile/sarahsky_lov', active:false}, function(tab) {
        //     bg.cupid.tabId = tab.id;
        // });

    }
});

function bind(varName, elementId){
    var lastValue;
    function check(){
      if(lastValue !== window[varName]){
        lastValue = window[varName];
        document.getElementById(elementId).innerHTML = lastValue; 
      }
    }
    //poll for changes every 50 milliseconds
    setInterval(check, 50); 
}

bind(bg.cupid.messageCount, "messageCount");