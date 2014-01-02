javascript:

var linkbackBanner = 'http://www.randomdit.com/poe/poebanner.png';
var league;
var index = 1;
var buyouts = '';
var standard = '';
var hasOnlyBuyOut = false;
var existingShopdata = '';
var hasBoth = false;

function init() {
  $('body,html').animate({scrollTop: 0}, 800);
  showOverlay();
}

function getTabs() {

  var tabsDOM = '';
  var tabsList = [];

  $.ajax({
       type: "GET",
       url: 'http://www.pathofexile.com/character-window/get-stash-items?league=' + league + '&tabs=1&tabIndex=' + index--,
       success: function(response) {
         var tabs = response.tabs;
         $.each(tabs, function(tabsIndex, tabsValue){
            tabvalue = tabsValue.i + 1;
            tabName = tabsValue.n;
            tabsDOM += '<div class="tabsItem" data-tabNumber ="' + tabvalue + '" data-tabName = "' + tabName + '"></div>';
            tabsList.push(tabsValue.src);
         });

         $('.userStashes').append(tabsDOM);
         $('.stashInstruction').show();

         $('.userStashes .tabsItem').css({
           'display': 'inline-block',
           'height': '26px',
           'margin-right': '10px',
           'position': 'relative',
           'background-position': '0px 51px'
         });

        var $eachTab = $('.userStashes .tabsItem');

        $.each($eachTab, function(eachTabIndex, eachTabValue){
          var $self = $(this);
          var img = new Image();
          img.onload = function() {
            $self.css('min-width',this.width + 'px');
          };
          img.src = tabsList[eachTabIndex];
          $(this).css({
              'background-image': 'url(' + tabsList[eachTabIndex] + ')'
          });
        });

         $eachTab.hover(function() {
          $(this).css({
            'cursor': 'pointer',
            'background-position': '0px 50px'
          });
         }, function(){
          $(this).css({
            'cursor': 'pointer',
            'background-position': '0px 51px'
          });          
         });
        $('.btnGenerate').show();

        var selectedStashes = [];
        var ownTabStashes = [];
        var ownTabNames = [];
        var uniqueSelectedStashes = [];
        var uniqueOwnTabStashes = [];

        $eachTab.click(function() {
          var clickedIndex = $(this).data('tabnumber');
          var clickedName = $(this).data('tabname');

          if (confirm('Click OK to make this tab its own spoiler group (good for buy out tabs)')) {
            $(this).addClass('ownTab');
            var tabName = prompt('Enter a custom name for your tab:', clickedName);
            
            if (tabName !== '') {
              ownTabNames.push(tabName);
            } else {
              ownTabNames.push(clickedName);
            }

          } else {

          }

          if (!$(this).hasClass('selected')) {
            $(this).addClass('selected');
          
            $(this).css({
              'border': 'solid 2px'
            });

            if ($(this).hasClass('ownTab')) {
              $(this).css({
                'border-color': 'green'
              });
            }

            if (!$(this).hasClass('ownTab')) {
              if($.inArray(clickedIndex, selectedStashes) === -1) {
                selectedStashes.push(clickedIndex);
              }
            } else {
              if($.inArray(clickedIndex, ownTabStashes) === -1) {
                ownTabStashes.push(clickedIndex);
              }
            }
          } else {

            $(this).removeClass('selected');
            $(this).css({
              'border': 'none'
            });

            for(var i = selectedStashes.length - 1; i >= 0; i--) {
                if(selectedStashes[i] === clickedIndex) {
                   selectedStashes.splice(i, 1);
                }
            }

            for(var i = ownTabStashes.length - 1; i >= 0; i--) {
                if(ownTabStashes[i] === clickedIndex) {
                   ownTabStashes.splice(i, 1);
                }
            }
          }         
        });

          $('.btnGenerate').click(function(){
            if (ownTabStashes.length > 0 ) {

              fetchBuyoutTab(ownTabStashes, ownTabNames, function(){
                fetchItems(selectedStashes);
              });
            } else {
                fetchItems(selectedStashes);
            }

          });
       }, 
       error: function(error) {
        alert('Sorry either there seems to be no stashes in this league or you are nog logged in',index);
       }
  });
}

function deleteFromShop(item) {

  var cachedStorage = localStorage.poestashShops;
  var temp = [];
  var pieces = cachedStorage.split('|');
  $.each(pieces, function(i,v){
    temp.push(v);
  });

  for(var i = temp.length - 1; i >= 0; i--) {
      if(temp[i] === item) {
         temp.splice(i, 1);
      }
  }

  cachedStorage = temp.join('|');
  localStorage.poestashShops = cachedStorage;


}

function getShops() {
  var myShops = [];
  var finalConstruct = '';
  var poestashShops = localStorage.poestashShops;
    if (poestashShops){
      var temp = poestashShops.split('|');
      $.each(temp, function(i,v) {
        myShops.push(v);
      });
    }

  $.each(myShops, function(i,v){
    if (v !== ''){
      var temp = v.split('--');
      var shopName = temp[0];
      var shopUrl = temp[1];
      var shopLeague = temp[2];

      var itemdata = temp[0] + '--' + temp[1] + '--' + temp[2];
      finalConstruct += '<li><a href="' + shopUrl + '" target="_blank">' + shopName + '</a> (' + shopLeague + ') [<a href="#" class="deleteShopItem" data-itemdata="' + itemdata + '">x</a>]';
    }
  });
  return finalConstruct;  
}

function saveToShop(item) {

  if (!localStorage.poestashShops){
    localStorage.poestashShops = item;
  } else {
    localStorage.poestashShops += item;
  }

  var mySavedShops = getShops();
  $('.shoplist').html(mySavedShops);

  updateShopDataEvent();
}

function showOverlay() {
  var self = this;

  var twitterFollow = '<div class="twitterfollow" style="background: white;width: 500px;color: black;margin: 0 auto;margin-bottom: 10px;margin-top: 10px;border-radius: 4px;font-size: 15px;">Follow us <a href="https://twitter.com/Poestash" target="_blank">@poestash</a> for update announcements and questions</div>';
  var donateButton = '<div class="donateButton"><form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top"><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="9NFZS9PMPKBSE"><input type="image"src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"><img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1"></form></div>';

  var closeButton = '<div class="close" style="display: inline;position: absolute;right: 149px;">[x]</div>';

  var leagues = '<div class="leagueBtnContainer"><div class="leagueBtn" data-league ="Standard">Standard</div><div class="leagueBtn" data-league ="Hardcore">Hardcore</div><div class="leagueBtn" data-league ="Domination">Domination</div><div class="leagueBtn" data-league ="Nemesis">Nemesis</div></div>';

  var userStashes = '<div class="userStashes"><span class="stashInstruction">Select your stash:</span></div>';

  var sellOn = '<div class="sellon" style="font-size:19px">Sell on: <a href="http://www.pathofexile.com/forum/new-thread/306">Standard</a> | <a href="http://www.pathofexile.com/forum/new-thread/305">Hardcore</a> | <a href=" http://www.pathofexile.com/forum/new-thread/427">Domination</a> | <a href="http://www.pathofexile.com/forum/new-thread/430">Nemesis</a></div>';
  var byline = '<div class="byline">Visit Official: <a href="http://pathofexilestash.blogspot.com">PoeStash</a></div>';

  var generate = '<div class="btnGenerate" style="display:none">Generate</div>';

  var myShops = '<div class="myshops-container" style="max-width: 680px; margin: 0 auto; margin-bottom: 20px"><h3>My Shops</h3>Shop Name:<input type="text" id="shopname" class="shoptxtbox">Shop URL:<input type="text" id="shopurl" class="shoptxtbox">Shop League:<input type="text" id="shopleague" class="shoptxtbox"><div class="addShop medButton">Add</div><div class="myshops" style="margin-top: 10px;border:solid 1px; text-align:left;padding:10px"><ul class="shoplist"></ul></div></div>';

  var note = '<div class="note">Note: if your post does not update, try to hit refresh, most likely it is the forum autosave feature interrupting with the bookmarklet.</div>';

  var contact = '<div class="contact">Comments and suggestions: <a href="http://pathofexilestash.blogspot.com/">Official Website</a> | <a href="http://www.reddit.com/r/pathofexile/comments/1tw8xz/tool_introducing_poestash_shop_creatormanager/">Reddit Post</a> | <a href="http://www.pathofexile.com/forum/view-thread/729127">Poe Forum</a></div>';

  $('body').prepend('<div class="overlay">' + donateButton + byline + twitterFollow + closeButton + sellOn + '<h3>PoeStash</h3><p>Select your character league:</p>' + leagues + userStashes + generate + myShops + note + contact +'</div>');

  $('.overlay .donateButton').css({
    'padding-top': '20px'
  });

  $('.overlay h3').css({
    'font-size': '65px',
    'font-family': 'FontinSmallCaps, Verdana, Arial, Helvetica, sans-serif',
    'padding-top': '2%'
  });

  $('.leagueBtnContainer').css({
    'margin-top': '30px'
  });

  $('.overlay .leagueBtn').css({
    'font-size': '25px',
    'padding-left': '10px',
    'display': 'inline',
    'padding': '5px',
    'border': 'solid 1px',
    'margin-right': '10px'
  });

  $('.medButton').css({
    'font-size': '25px',
    'padding-left': '10px',
    'display': 'inline',
    'padding': '5px',
    'border': 'solid 1px',
    'margin-left': '10px'
  });

  $('.userStashes').css({
    'margin-top': '30px',
    'max-width': '500px',
    'margin': '30px auto'
  });

  $('.stashInstruction').css({
    'position': 'relative',
    'top': '-10px',
    'display': 'none'
  });

  $('.btnGenerate').css({
    'font-size': '28px',
    'padding': '10px',
    'border': 'solid 1px',
    'width': '200px',
    'margin': '0 auto',
    'margin-bottom': '30px'
  });

  $('.overlay').css({
    'min-height': '1200px',
    'width': '100%',
    'background':'black',
    'z-index': '100000',
    'opacity': '0.85',
    'position': 'absolute',
    'text-align': 'center'
  });

  $('.shoptxtbox').css({
    'margin-left': '5px',
    'margin-right': '5px',
    'width': '100px',
    'background':'black',
    'border': 'solid 1px rgb(163, 141, 109)',
    'font-size': '25px',
    'color': 'rgb(163, 141, 109)'
  });

  $('.addShop').click(function(e){

    e.preventDefault();
    var shopName = $('#shopname').val();
    var shopURL = $('#shopurl').val();
    var shopLeague = $('#shopleague').val();
    var shopItemData = '';
    if (shopName === '' || shopURL === '' || shopLeague === ''){
      alert('Please complete all fields in order to add');
    } else {

      if (shopURL.indexOf('http://') === -1) {
        shopURL = 'http://' + shopURL;
      }
      shopItemData = '|' + shopName + '--' + shopURL + '--' + shopLeague;
      $('#shopname').val('');
      $('#shopurl').val('');
      $('#shopleague').val('');
    }
    saveToShop(shopItemData);

  });

  $('.btnGenerate').hover(function() {
    if (!$(this).hasClass('leagueSelected')) {
      $(this).css({
        'cursor': 'pointer',
        'background': 'rgb(80,22,7)'
      });
    }
  }, function() {
    if (!$(this).hasClass('leagueSelected')) {
      $(this).css({
        'background': 'black'
      });
    }
  });

  $('.medButton').hover(function() {
      $(this).css({
        'cursor': 'pointer',
        'background': 'rgb(80,22,7)'
      });
  }, function() {
      $(this).css({
        'background': 'black'
      });
  });

  $('.leagueBtn').hover(function() {
    if (!$(this).hasClass('leagueSelected')) {
      $(this).css({
        'cursor': 'pointer',
        'background': 'rgb(80,22,7)'
      });
    }
  }, function() {
    if (!$(this).hasClass('leagueSelected')) {
      $(this).css({
        'background': 'black'
      });
    }
  });

  $('.close').hover(function() {
    if (!$(this).hasClass('leagueSelected')) {
      $(this).css({
        'cursor': 'pointer',
        'color': 'white'
      });
    }
  }, function() {
    if (!$(this).hasClass('leagueSelected')) {
      $(this).css({
        'color': 'rgb(163, 141, 109)'
      });
    }
  });

  $('.close').click(function(){
    $('.overlay').remove();
  });

  $('.leagueBtn').click(function(){
    var clickedLeague = $(this).data('league');
    league = clickedLeague;
    index = 1;

    if (!$(this).hasClass('leagueSelected')){
      $(this).addClass('leagueSelected');
      $(this).css({
        'background':'rgb(255,200,0)'
      });
    } else {
      $(this).css({
        'background':'black'
      });
    }

    $(this).siblings().css({
      'background': 'black'
    });

    $(this).siblings().removeClass('leagueSelected');


    getTabs();

  });

  var mySavedShops = getShops();

  $('.shoplist').append(mySavedShops);
  $('.deleteShopItem').click(function(e){
    e.preventDefault();
    var item = $(this).data('itemdata');
    deleteFromShop(item);
    $(this).parent().slideUp();
  });
}

function updateShopDataEvent () {
  $('.deleteShopItem').click(function(e){
    e.preventDefault();
    var item = $(this).data('itemdata');
    deleteFromShop(item);
    $(this).parent().slideUp();
  });
}

function fetchBuyoutTab (tabs, tabnames, callback) {
 var combinedItems = [];
  var tabsLength = tabs.length;
  var finalMerged = [];
  var count = 0;
  var textareabox = $('textarea').text();
  $.each(tabs, function(index, value){
    var proceed = false;
    $.ajax({
        type: "GET",
        async: false,
        url: 'http://www.pathofexile.com/character-window/get-stash-items?league=' + league + '&tabs=1&tabIndex=' + --value,
        success: function(response) {
          proceed = true;
          var item = response.items;
          combinedItems.push(item);
          buyouts = generationCustomTabBBCode(combinedItems, tabnames, function(){
            callback();
          });

          if (hasOnlyBuyOut) {
            if (textareabox !== ''){
              var existText = $('textarea').text();
              existText = existText.replace(/-.+-/ig, buyouts);
              $('textarea').text(existText);
            } else {
              var metaText = 'Welcome to [name of your shop]:\n\nMessage me in game: [your ign]\n\nFeatured Items:\n\n';
              $('textarea').text(metaText + '-' + buyouts + '-' + '\n[url=http://pathofexilestash.blogspot.com/][img]' + linkbackBanner + '[/img][/url]\n\n');
            }

            $('.overlay').fadeOut();
          } else {
            hasBoth = true;
          }
        }
    });
  });
}


function fetchItems(tabs, nodata) {
  var combinedItems = [];
  var tabsLength = tabs.length;
  var finalMerged = [];
  var count = 0;

  if (tabs.length === 0) {
    hasOnlyBuyOut = true;
  } else {
    $.each(tabs, function(index, value){
      $.ajax({
          type: "GET",
          url: 'http://www.pathofexile.com/character-window/get-stash-items?league=' + league + '&tabs=1&tabIndex=' + --value,
          success: function(response) {
            var item = response.items;
            combinedItems.push(item);
            count++;

            if (count === tabsLength) {
              $.each(combinedItems, function(i,v){

                if (combinedItems[i]){
                  finalMerged = $.merge(finalMerged, combinedItems[i]);
                }
              });
                generateBBCode(finalMerged);
            }
          }
      });
    });
  }

  
}

function generationCustomTabBBCode(data, tabName, callback) {
  
  var finalData = [];
  var finalBBcode = [];
  var bbcode = '';
  var combinedBBCoode = '';

  $.each(data, function(index,value) {
    bbcode = '';
    $.each(value, function(valueIndex,valueValue) {
      var location = valueValue.inventoryId;
      var x = valueValue.x;
      var y = valueValue.y;
      var item = {};
      item.coordinates = 'x="' + x + '" y="' + y + '"';
      item.location = location;
      if (!finalData[tabName[valueIndex]]) {
        finalData[tabName[valueIndex]] = [];
      };

      finalData[tabName[valueIndex]].push(item);
      bbcode += '[linkItem location="' + location + '" league="' + league + '" x="' + x + '" y="' + y + '"]';
    });

    finalBBcode.push(bbcode);
  });

  $.each(finalBBcode, function(i,v) {
    v = v.toString().replace(/undefined/ig, '');
    combinedBBCoode += '[spoiler="' + tabName[i] + '"]' + v + '[/spoiler]';
  });

  callback();
  return combinedBBCoode;
}

function generateBBCode(data) {
  
          var tabpics = [];
          var bbcode = '';
          var forumbb = $('textarea').text();

          var itemTypes = {
            Weapons: ['Bow', 'Dagger', 'OneHandAxe', 'OneHandMace', 'OneHandSword', 'Sceptre', 'Staff', 'ThrustingOneHandSword', 'TwoHandAxe', 'TwoHandMace', 'TwoHandSword', 'Wand'],

            Armour: ['BodyArmour', 'Boot', 'Glove', 'Helmet', 'Shield'],

            Jewellery: ['Amulet', 'Belt', 'Ring'],

            Other: ['Other', 'Currency'],

            Gem: ['Gem'],

            Flask: ['Flask'],

            Map: ['Map']
          };

          var matched = [];
          var temp = {};
          $.each(data, function(index,value) {
            var location = value.inventoryId;
            var x = value.x;
            var y = value.y;
            var category = 'Other';
            var item = {
              data : {},
              category: {}
            };
            var iconPath = value.icon;
            var type = iconPath.split('/');
            var category = type[type.length-2];

            if (category === 'Support') {
              category = type[type.length-3];
            }

            if (type[3] === 'gen') {
              category = 'Flasks';
            }

            $.each(itemTypes, function(index, value) {
              $.each(value, function(indexlv2, valuelv2) {
                if (valuelv2 !== 'Currency') {
                  valuelv2 = valuelv2 + 's';
                }
                if (category === valuelv2) {
                  item.parentCategory = index;
                }
              });
            });

            item.data.coordinates = 'x="' + x + '" y="' + y + '"';
            item.data.location = location;
            item.category = category;

            matched.push(item);

            bbcode += '[spoiler="' + category + '"][linkItem location="' + location + '" league="' + league + '" x="' + x + '" y="' + y + '"][/spoiler]';

          });

          var cats = ['Weapons', 'Armour', 'Jewellery', 'Other' , 'Gem', 'Flask' , 'Map'];
          var subcats = ['Bow', 'Dagger', 'OneHandAxe', 'OneHandMace', 'OneHandSword', 'Sceptre', 'Staff', 'Thrusting OneHandSword', 'TwoHandAxe', 'TwoHandMace', 'TwoHandSword', 'Wand','BodyArmour', 'Boot', 'Glove', 'Helmet', 'Shield','Amulet', 'Belt', 'Ring','Other', 'Currency', 'Gem', 'Flask', 'Map'];

          var finalBB = {
            Weapons: '',
            Armour: '',
            Jewellery: '',
            Other: '',
            Flask: ''
          };

          $.each(matched, function(index, value) {
            $.each(cats, function(indexCats, valueCats) {
              if (value.parentCategory === valueCats) {
                $.each(subcats, function(indexSubcats, valueSubcats){
                  if (valueSubcats !== 'Currency') {
                    valueSubcats = valueSubcats + 's'
                  }
                  if (value.category === valueSubcats) {
                    if (!temp[value.category]) {
                      temp[value.category] = {};
                    }

                    if (!temp[value.category]['data']) {
                      temp[value.category]['data'] = {};
                    }

                    if (!temp[value.category]['parent']) {
                      temp[value.category]['parent'] = {};
                    }

                    temp[value.category]['data'] += '[linkItem location="' + value.data.location + '" league="' + league + '" ' + value.data.coordinates + ']';

                    temp[value.category]['parent'] = value.parentCategory;                

                    finalBB[value.parentCategory] += '[linkItem location="' + value.data.location + '" league="' + league + '" ' + value.data.coordinates + ']';
                  }
                });
              } 
            });
          });
          
          var found = {};

          $.each(temp, function(indexTemp, valueTemp) {
            var parentCategory = temp[indexTemp].parent;
            var tempKeys = temp[indexTemp];

            if (!found[parentCategory]) {
              found[parentCategory] = {};
            }

            if (!found[parentCategory][indexTemp]) {
              found[parentCategory][indexTemp] = {};
            }
            found[parentCategory][indexTemp] = temp[indexTemp].data;
          });

          var finalbbcode = '';
          var innerbbcode = {};

          $.each(found, function(foundIndex, foundValue){
            $.each(foundValue, function(indexFoundValue, valueFoundValue) {
             
              if (!innerbbcode[foundIndex]) {
                innerbbcode[foundIndex] = {};
              }
                innerbbcode[foundIndex] +='[spoiler="' + indexFoundValue + '"]' + valueFoundValue + '[/spoiler]';
            });
          });

          $.each(innerbbcode, function(indexInnerbbcode, valueInnerbbcode){
            if (innerbbcode !== {}) {
            finalbbcode += '[spoiler="' + indexInnerbbcode + '"]' + valueInnerbbcode + '[/spoiler]';
          }
          });

          finalbbcode = finalbbcode.toString().replace(/\[object Object]/ig, '');

          if ($('textarea').text() !== ''){
            if (hasBoth === true) {
              var existText = $('textarea').text();
              $('textarea').text(existText);
            } else {
              var existText = $('textarea').text();
              existText = existText.replace(/-.+-/ig, finalbbcode);
              $('textarea').text(existText);
            }
          } else {
            var metaText = 'Welcome to [name of your shop]\n\nMessage me in game: [your ign]\n\nFeatured Items:[Add your featured items manually]\n\n';
            $('textarea').text(metaText + '-' + buyouts + finalbbcode + '-' +'\n[url=http://pathofexilestash.blogspot.com/][img]' + linkbackBanner + '[/img][/url]\n\n');
          }

          $('.overlay').fadeOut();
}

init();