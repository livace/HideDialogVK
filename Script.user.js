// ==UserScript==
// @name         Hide Dialogs VK
// @version      0.1
// @description  Hide Dialogs you don't want to see
// @author       Livace
// ==/UserScript==

(function(window, undefined){

    var locale = [];
    locale['ru'] = {
        hide : 'Скрыть диалог',
        show : 'Показать все диалоги'
    };
    locale['en'] = {
        hide : 'Hide dialog',
        show : 'Show all dialogs'
    }

    var lang = document.querySelector('html').getAttributeNode('lang').value;
    console.log("Language : " + lang);
    if(typeof locale[lang] === undefined) lang = 'en';
    var w;
    if(unsafeWindow !== undefined){
        w = unsafeWindow;
    }
    else{
        w = window;
    }

    if(w.self != w.top) return;

    if(!/https:\/\/vk.com\//.test(w.location.href)){
        return;
    }

    if(localStorage.blocked === undefined) localStorage.blocked = '';

    function hide(){
        var id = document.getElementsByClassName('nim-dialog_selected')[0];
        if(localStorage.blocked!==''){ localStorage.blocked+= '~'; }
        localStorage.blocked+=id.getAttributeNode('data-list-id').value;
        run();
    }

    function showAll(){
        if(localStorage.blocked!==''){
            var toHide = localStorage.blocked.split('~');
            for(var i = 0; i < toHide.length; i++){
                var el = document.getElementsByClassName('nim-dialog _im_dialog _im_dialog_'+toHide[i])[0];
                if(el!==null && el!==undefined && el.style !== undefined)
                    el.style.display = 'block';
            }
        }
        localStorage.blocked = '';
        run();
    }

    function drawButtons(){
        var menu = document.getElementsByClassName('ui_actions_menu _ui_menu');
        for(var i = 0; i < menu.length; i++){
            var block = menu[i];
            if(block === undefined || block.parentElement === undefined) continue;
            if(block.parentElement.getAttributeNode('onmouseover').value !== 'uiActionsMenu.show(this);') continue;
            if(block.children[0] === undefined) continue;
            console.log('Block children : ' + block.children[0]);
            console.log('Block children === undefined ??? : ' + block.children[0] !== undefined);
            if(block.children[0].getAttributeNode('data-action') !== null && block.children[0].getAttributeNode('data-action').value === 'hide') continue;

            var showButton = document.createElement('a');
            showButton.setAttribute('tabindex', '0');
            showButton.setAttribute('data-action', 'show');
            showButton.setAttribute('class', 'ui_actions_menu_item _im_action im-action im-action_search');
            showButton.innerHTML = locale[lang].show;
            showButton.addEventListener('click', function(){
                showAll();
            });
            block.insertBefore(showButton, block.children[0]);

            var hideButton = document.createElement('a');
            hideButton.setAttribute('tabindex', '0');
            hideButton.setAttribute('data-action', 'hide');
            hideButton.setAttribute('class', 'ui_actions_menu_item _im_action im-action im-action_leave');
            hideButton.innerHTML = locale[lang].hide;
            hideButton.addEventListener('click', function(){
                hide();
            });
            block.insertBefore(hideButton, block.children[0]);
        }
    }

    function hideBlocked(){
        if(localStorage.blocked!==''){
            var toHide = localStorage.blocked.split('~');
            for(var i = 0; i < toHide.length; i++){
                var el = document.getElementsByClassName('nim-dialog _im_dialog _im_dialog_'+toHide[i])[0];
                if(el!==null && el!==undefined)
                    el.style.display = 'none';
            }
        }
    }

    var run = function(){
        drawButtons();
        hideBlocked();
    };

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    var observeDOM = (function() {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var eventListenerSupported = window.addEventListener;

        return function(obj, callback) {
            if (MutationObserver) {
                var obs = new MutationObserver(function (mutations, observer) {
                    if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
                        callback(mutations);
                    }
                });

                obs.observe(obj, {childList: true, subtree: true});
            } else if (eventListenerSupported) {
                obj.addEventListener('DOMNodeInserted', callback, false);
                obj.addEventListener('DOMNodeRemoved', callback, false);
            }
        };
    })();
    observeDOM(document.body, run);
}) (window);
