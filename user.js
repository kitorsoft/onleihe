// ==UserScript==
// @name           Onleihe
// @namespace      kitorsoft
// @description    Onleihe externe Merkliste
// @author         Kian Torabli

// @match          https://www.onleihe.de/*

// @require        https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.18.1/moment.min.js
// @require        https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js
// @require        https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js
// @require        https://cdn.datatables.net/1.10.20/js/jquery.dataTables.min.js
// @require        https://cdn.datatables.net/1.10.20/js/dataTables.bootstrap4.min.js
// @require        https://cdn.datatables.net/select/1.3.1/js/dataTables.select.min.js
// @require        https://cdn.datatables.net/buttons/1.6.1/js/dataTables.buttons.min.js
// @require        https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js
// @require        https://cdn.datatables.net/buttons/1.6.1/js/buttons.html5.min.js

// @resource       bootstrapCss https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css
// @resource       bootstrapThemeCss https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css
// @resource       dataTableCss https://cdn.datatables.net/1.10.20/css/dataTables.bootstrap4.min.css
// @resource       dataTableSelectCss https://cdn.datatables.net/select/1.3.1/css/select.dataTables.min.css
// @resource       dataTableButtonsCss https://cdn.datatables.net/buttons/1.6.1/css/buttons.dataTables.min.css
// @resource       fontAwesomeCss https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css

// @grant          GM_getResourceText
// @grant          GM_addStyle
// @grant          GM_getResourceURL

// @version        0.1
// ==/UserScript==

// unused
// @require        https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// @resource       jQueryUiCss https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css
// @resource       jQueryImages https://raw.githubusercontent.com/julienw/jquery-trap-input/master/lib/jquery/themes/base/images/ui-icons_888888_256x240.png
// @require        https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js
// @resource       bootstrapCss https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css

// make sure variables are declared before use
'use strict';

// avoid editor warnings
/* globals $ */
/* globals moment */

// avoid jQuery conflicts
this.$ = this.jQuery = window.jQuery.noConflict(true);

$( document ).ready(function()
{
    init();
});

function init()
{
  let isResponsive = ($("meta[name='viewport']").length > 0);

  if(!isResponsive)
  {
    console.log("This script only works on responsive design");
    return;
  }

  console.log("init()");
  if(document.initDone == true || $("a:contains('Hilfe')").length == 0)
  {
    console.log("document not yet ready or init already done - exit");
    return;
  }
  console.log("running init");

//  GM_addStyle(GM_getResourceText ("jQueryUiCss"));
  GM_addStyle(GM_getResourceText("bootstrapCss").replace(/\/\*# sourceMappingURL=.* \*\//, ""));
  GM_addStyle(GM_getResourceText("bootstrapThemeCss").replace(/\/\*# sourceMappingURL=.* \*\//, ""));
  GM_addStyle(GM_getResourceText("dataTableCss").replace(/\/\*# sourceMappingURL=.* \*\//, ""));
  GM_addStyle(GM_getResourceText("dataTableSelectCss").replace(/\/\*# sourceMappingURL=.* \*\//, ""));
  GM_addStyle(GM_getResourceText("dataTableButtonsCss").replace(/\/\*# sourceMappingURL=.* \*\//, ""));
  GM_addStyle(GM_getResourceText("fontAwesomeCss").replace(/\/\*# sourceMappingURL=.* \*\//, "")
    .replace(/\.\.\/fonts\//g, "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/"));

  var backgroundColor = $("a.faq").css("background-color");
  var fontColor = $("a.faq").css("color");

  GM_addStyle(`
    /* externer merkzettel button in item menu */
    div.button a[link]::before { content: "Zum externen Merkzettel hinzufügen"; }
    div.button.alreadyOnList a[link]::before { content: "Vom externen Merkzettel löschen"; }
    div.article-info-button div.button i.fa.fa-file-text-o:after
    {
      position: relative;
      content: "\\f0fe"; /* fa-plus-square */
      color: green;
      right: -0.2em;
    }
    div.article-info-button div.button.alreadyOnList i.fa.fa-file-text-o:after
    {
      position: relative;
      content: "\\f146"; /* fa-minus square */
      color: red;
      right: -0.2em;
      opacity: 80%;
    }
    /* links and buttons left-aligned */
    div.article-info-button div.button a.watchlist.link:not([link]) { padding-left: 5px; }
    html body .pagebox .pagebox-item main .title .article-info .button,
    html body .pagebox .pagebox-item article.list-item .article-info .article-info-button .button
    {
      text-align: left;
    }

    /* table cell style */
    tbody#merkzettelItems tr td { overflow: hidden; }
    tbody#merkzettelItems tr td + td { max-width: 200px; }

    /* modal dialog */
    div.modal-dialog { max-width: 60%; }
    div.modal-header { background-color: ` + backgroundColor+ `; }
    div.modal-header { color: ` + fontColor+ `; }
    div.modal-header .close { text-shadow: none; }
    div.modal-content { border: none; }

    /* datatables buttons */
    xbutton.dt-button, div.dt-button, a.dt-button { border-radius: 4px; }
    div.dataTables_wrapper button { transition-duration: 0.2s; border-radius: 4px;}
    div.dataTables_wrapper button:hover:not(.disabled) { background-color: ` + backgroundColor + `; color: ` + fontColor + `; background-image: none; filter: none;}

    /* datatables should use the available width */
    .modal-content, table.table: { width: 100% !important; }
    table.table { table-layout: fixed; }

    /* the working spinner */
    div#merkzettelLoading { position: absolute; top: 50%; left: 50%; display: none; color: ` + backgroundColor + `; }
    div#merkzettelLoading.working { display: block; }

    /* hide the ugly top menu, which is "above the application" */
    header div.row-1 { display:none; }

    /* hide menu icons on small screens */
    @media only screen and (max-width: 804px)
    {
      html body header #start-media-type #media-type-nav i.fa
      {
        display: none;
      }
    }

    /* for the read filter in the data table */
    select.filterDropDown { width: max-content; }

    /* icon for built-in merkzettel should be slightly higher up */
    html body .button a.watchlist .svg-icon { top: -4px; }

    /* list of books only 1 column wide */
    html body .pagebox .pagebox-item .result-list ul li,
    html body .pagebox .pagebox-item .result-list ul
    {
      display: block;
    }
  `);

  // create links to add/remove items from externer merkzettel
  var as = new Array();
  $("a.watchlist.link").each(
    function(index)
    {
      as.push($(this));
    }
  );

  as.forEach(
    function(item, index)
    {
      // div.onclick-menu-content > div.button > a
      // DOM href contains full URL, while jQuery href is only the relative link
      var link = item[0].href.replace("myBib", "mediaInfo").replace("551", "200");

      let i = $('<i class="fa fa-file-text-o" style="color: ' + backgroundColor + '; font-size: x-large; display: inline;"></i>');
      var ndiv = $("<div>");
      ndiv.addClass("button");
      var a = $("<a>");
      a.addClass("watchlist");
      a.addClass("link");
      //a.attr("href", "#");
      a.attr("link", link);
      a.click(function(event) { addRemoveWatchList(this.getAttribute("link"), event.target); });
      document.db.alreadySaved(link)
        .catch((error) => { console.error("error", error); })
        .then(
          (saved) =>
            {
                  if(saved)
                  {
                    ndiv.addClass("alreadyOnList");
                  }
                },
          (message) =>
            {
              console.error("cannot determine alreadySaved status", message);
              ndiv.removeClass("alreadyOnList");
            }
          )
        ;
      ndiv.append(i);
      ndiv.append(a);
      $(item).parent().after(ndiv);
    }
  ); // each


  // create popup dialog
  $("body").append(`
<div id="merkliste" class="modal fade" role="dialog" aria-labelledby="merklisteModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="merklisteModalLabel">Externe Merkliste</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
<table id="merkzettelTable" class="table table-striped table-bordered" style="width: 100%; table-layout: fixed;">
  <thead>
    <tr>
      <th>Titel</th>
      <th>URL</th>
      <th>Verfügbar</th>
      <th>Gelesen</th>
      <th>Aktion</th>
    </tr>
  </thead>
  <tbody id="merkzettelItems">
  </tbody>
  <!--tfoot><td id="listCount"colspan="4" align="center"/></tfoot-->
</table>
      </div>
      <div class="modal-footer">
        <div id="merkzettelLoading"
           class="fa fa-cog fa-spin fa-3x fa-fw"
           role="status">
          <span class="sr-only">Working ...</span>
        </div>
      </div>

    </div>
  </div>
</div>
  `);

  // add busy  handler
  $('#merkliste').on("busy", setDialogBusy);

  // create link to externer merkzettel (see above dialog)
  addMenuButton("#", "Externer Merkzettel", "fa fa-file-text-o", backgroundColor);
  $("i.fa-file-text-o").closest("a").click(showWatchList);

  // re-establish buttons Mein Konto, Logout, Hilfe, because we hide the ugly top layer
  var btnMeinKonto = $("a.prime:contains('Mein Konto')");
  var btnLogout = $("a:contains('Logout')");
  var btnHilfe = $("a.faq:contains('Hilfe')");

  btnMeinKonto.length && addMenuButton(btnMeinKonto.attr("href"), btnMeinKonto.text(), "fa fa-user", backgroundColor);
  btnLogout.length && addMenuButton(btnLogout.attr("href"), btnLogout.text(), "fa fa-sign-out", backgroundColor);
  if(btnHilfe.length > 0)
  {
    addMenuButton(btnHilfe.attr("href"), btnHilfe.text(), "fa fa-question-circle", backgroundColor);
    $("i.fa-question-circle").closest("li").css({"position": "absolute", "right": "1em", "top": "7px"});
  }

  document.initDone = true;
}

/******************************************************
** Helper functions
*/

function addMenuButton(href, text, cls, color)
{
    $("nav#media-type-nav ul").append(`
      <li>
		<div class="evideo-box">
          <a href="` + href + `">
            <i class="` + cls + `" style="color: ` + color + `; padding-right:8px"></i>
			<span class="nav-label">` + text + `</span>
            <span class="nav-label-text hidden">` + text + `</span>
		  </a>
        </div>
	  </li>
  `);
}

function addRemoveWatchList(link, target)
{
  if(!$(target).parent().hasClass("alreadyOnList"))
  {
    var title = $(target).closest("div.article-info").find("div.title-name").text();
    // starts with "Titel:", no blank - cut it off
    title = title.substring(6);

    document.db.addTitle(title, link)
      .catch((error) => { console.error("error", error); })
      .then(
        (value) =>
          {
            $(target).parent().addClass("alreadyOnList");
            // todo: updateAvailability(value);
            // need to refactor updateAvailability, extract getAvailability, then do a simple updateItem from here, no table update (does not exist)
            //  .catch((error) => { console.error("error", error); })
            // no "then", we are not interested in whether updateAvailability failed
            ;
          },
        (message) =>
          {
            console.error("insert failed", message);
        }
      )
    ;
  }
  else
  {
    document.db.deleteTitle(link)
      .catch((error) => { console.error("error", error); })
      .then(
        (value) =>
          {
            $(target).parent().removeClass("alreadyOnList");
          },
        (message) =>
        {
          console.error("delete failed", message);
        }
      )
    ;
  }
}

function showWatchList(event)
{
  document.db.getAllItems()
    .catch((error) => { console.error("error", error); })
    .then(
      (items) =>
        {
          // to empty the table, destroy it first
          $('#merkzettelTable').DataTable({ retrieve: true}).destroy();
          // now remove all data from the basic table that is left
          var tbody = $("tbody#merkzettelItems");
          tbody.empty();

          // now we can add data again
          items.forEach((item, index) =>
            {
              tbody.append(`<tr>
                              <td>` + item.titel + `</td>
                              <td>` + item.url + `</a></td>
                              <td>` + ((item.verfuegbar == null) ? "" : moment(item.verfuegbar).format("YYYY-MM-DD")) + `</td>
                              <td>` + item.gelesen + `</td>
                              <td class="action"></td>
                            </tr>`);
              //var btn = $('<button type="button" class="btn btn-secondary">löschen</button>');
              //btn.click(() => { deleteWatchListItem(item.url, btn); });
              //$("tbody#merkzettelItems td.action").last().append(btn);
            }
        );

        // all data is there now, create the table again
        var table = $('#merkzettelTable').DataTable(
          {
            destroy: true, // destroy any former instance
            select: true,
            dom: 'Blfrtip',
            buttons:
              [
                {
                  extend: 'excel',
                  text:'<i class="fa fa-file-excel-o"></i>',
                  className: 'btn btn-secondary btn-xs',
                  titleAttr: "Exportieren als Excel" },
                {
                  text:'<i class="fa fa-calendar"></i>',
                  className: 'btn btn-secondary btn-xs',
                  titleAttr: "Verfügbarkeit neu laden",
                  action: function ( e, dt, node, config ) { updateAllAvailabilities(); }}
              ],
            columns:
              [
                {
                  // title
                  render: function ( data, type, row )
                  {
                    if(type === "display")
                    {
                      return "<a target='_new' href='" + row[1] + "'>" + data + "</a>";
                    }
                    else // sort, filter, type
                    {
                      return data;
                    }
                  },
                  width: "300px"
                },
                { visible: false }, // url
                { // available date
                  render: function(data, type, row)
                  {
                    if(type === "sort" || type === "type")
                    {
                      return data;
                    }
                    else // display, filter
                    {
                      return (data !== "") ? moment(data).format("DD.MM.YYYY") : "";
                    }
                  }
                },
                { // read
                  render: function(data, type, row)
                  {
                    if(type === "display")
                    {
                      if(data === "true")
                      {
                        return '<button class="dt-button btn btn-secondary fa fa-check-square"></button>';
                      }
                      else
                      {
                        return '<button class="dt-button btn btn-secondary fa fa-square"></button>';
                      }
                    }
                    else // sort, filter, type
                    {
                      return data;
                    }
                  },
                  orderable: false
                },
                { // action
                  data: null,
                  defaultContent: '<button class="dt-button btn btn-secondary fa fa-trash"></button>',
                  orderable: false
                }
              ],
            language :
              {
                "decimal":        ",",
                "emptyTable":     "Keine Daten",
                "info":           "Zeilen _START_ bis _END_ von _TOTAL_",
                "infoEmpty":      "Zeilen 0 bis 0 von 0",
                "infoFiltered":   "(gefiltert aus insgesamt _MAX_ Zeilen)",
                "infoPostFix":    "",
                "thousands":      ".",
                "lengthMenu":     "_MENU_ Zeilen pro Seite",
                "loadingRecords": "Lade...",
                "processing":     "Verarbeite...",
                "search":         "Suchen:",
                "zeroRecords":    "Keine passenden Zeilen gefunden",
                "paginate": {
                  "first":      "Erste",
                  "last":       "Letzte",
                  "next":       "Nächste",
                  "previous":   "Vorherige"
                }
              }
          }
        );

        // add a filter drop down to the gelesen column
        let colGelesen = table.columns(3);
        if($(colGelesen.header()).find("select.filterDropDown").length == 0)
        {
        $(`<i class="fa fa-filter" style="margin-left:1em"></i>
           <select class="filterDropDown">
             <option value="">Alle</option>
             <option value="true">Ja</option>
             <option value="false" selected>Nein</option>
           </select>`)
          .appendTo( $(colGelesen.header()) )
          .on( 'change', function (event)
            {
              let val = $(this).val();
              colGelesen
                .search(val)
                .draw();
              event.stopPropagation();
            }
          );
          colGelesen.search("false").draw();
        }

        // make the delete and read buttons work
        $('#merkzettelTable tbody').on( 'click', 'button', function (event)
          {
            let data = table.row( $(this).parents('tr') ).data();
            let href = data[1];

            if($(this).hasClass("fa-trash")) // delete
            {
              deleteWatchListItem(href, $(this));
            }
            else // set read
            {
              let read = $(this).hasClass("fa-square");
              markWatchListItemRead(href, read, $(this));
            }

            event.stopPropagation();
          });

        $('#merkliste').modal(
          {
            backdrop: 'static',
            keyboard: false
          }
        );

        },
      (message) =>
        {
          console.error("cannot get merkzettel items", message);
        }
      )
  ;
}

function setDialogBusy(event, busy)
{
  if(busy)
  {
    $("#merkliste").attr("busy", true);
    $("#merkliste :input").prop("disabled", true);
    $("#merkzettelLoading").addClass("working");
  }
  else
  {
    $("#merkliste").attr("busy", false);
    $("#merkliste :input").prop("disabled", false);
    $("#merkzettelLoading").removeClass("working");
  }
}

function deleteWatchListItem(link, target)
{
  console.log("deleteWatchListItem", arguments);
  document.db.deleteTitle(link)
    .catch((error) => { console.error("error", error); })
    .then(
      (value) =>
        {
          $("a[link='" + link + "']").parent().removeClass("alreadyOnList");
          $('#merkzettelTable').DataTable({retrieve:true}).row(target.closest("tr")).remove().draw();
        },
      (message) =>
        {
          console.error("delete failed", message);
        }
      )
  ;
}

function markWatchListItemRead(link, read, target)
{
  console.log("markWatchListItemRead", arguments);

  $('#merkliste').trigger("busy", true);

  document.db.getItem(link)
    .catch((error) => { console.error("error", error); $('#merkliste').trigger("busy", false); })
    .then(
      (value) =>
        {
          value.gelesen = read;

          document.db.updateItemData(value)
            .catch((error) => { console.error("error", error); })
            .then(
              (value) => { console.log("read item updated"); },
              (message) => { console.error("read item not updated", message); }
            )
            .finally(() => { $('#merkliste').trigger("busy", false); })
          ;
        },
      (message) =>
        {
          console.error("mark read failed", message);
          $('#merkliste').trigger("busy", false);
        }
      )
  ;
}

function updateAllAvailabilities()
{
  var updatePromises = [];

  $('#merkliste').trigger("busy", true);

  document.db.getAllItems()
    .catch((error) => {})
    .then(
      (value) =>
        {
          // start refresh for each url
          value.forEach(
            (item, index) =>
              {
                updatePromises.push(updateAvailability(item));
              }
          );
          // when all is done, update table
          Promise.allSettled(updatePromises)
            .catch((error) => { console.error("error", error); })
            .then(
              (value) =>
                {
                  // reload table
                },
              (message) =>
                {
                  console.error("updateAllAvailabilities failed", message);
                  // display error to user?
                }
              )
            .finally(
              () =>
                {
                  $('#merkliste').trigger("busy", false);
                }
              )
        },
      (message) =>
        {
          console.error("updateAllAvailabilities failed", message);
          // display error to user?
        }
  )
}

function updateAvailability(item)
{
  console.log("updateAvailability", arguments);

  return new Promise((resolve, reject) =>
    {
      if(!item.gelesen)
      {
        /*************
        ** post cmdId=703&sK=1000&pText=Heimkehr+auf+die+Kamelien-Insel&pMediaType=-1&Suchen=Suchen
        ** https://www.onleihe.de/muenchen/frontend/search,0-0-0-0-0-0-0-0-0-0-0.html
        */

        // build a search url for the site of the book
        var url = item.url.replace(/\/frontend\/.*/, "/frontend/search,0-0-0-0-0-0-0-0-0-0-0.html");

        var request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var formData = "cmdId=703&sK=1000&pText=" + encodeURIComponent(item.titel) + "&pMediaType=-1&Suchen=Suchen";

        // When the request loads, check whether it was successful
        request.onload = function()
        {
          if (request.status === 200)
          {
            /**********
            ** find availability date $($.parseHtnl(request.response)).find(...)
            ** div.title-name mit text = item.titel
            ** -> parent -> div.unavailable text ist datum || div.available -> sofort
            **
            ** update item.id
            **/

            var elem = $($.parseHTML(request.response))
              .find("div.title-name:contains('" + item.titel + "')")
              .parent()
              .find("div.unavailable");
            if(elem.length == 1)
            {
              var dateMatch = elem.text().match(/(\d+)\.(\d+)\.(\d+)/);
              var date = new Date(dateMatch[3], dateMatch[2]-1, dateMatch[1]);
              if(item.verfuegbar != date)
              {
                item.verfuegbar = date;
                document.db.updateItemData(item)
                  .catch((error) => { console.error("error", error); reject(error); })
                  .then(resolve, reject);

              }
            }
            else // available now
            {
              if(item.verfuegbar != null)
              {
                item.verfüegbar = null;
                document.db.updateItemData(item)
                  .catch((error) => { console.error("error", error); reject(error); })
                  .then(resolve, reject);

              }
            }
          }
          else
          {
            reject(Error('Page didn\'t load successfully; error code:' + request.statusText));
          }
        }

        request.onerror = function()
        {
          reject(Error('XMLHttpRequest error.'));
        };

        request.send(formData);
      }
      else
      { // read items do not require any availability date
        if(item.gelesen != "")
        {
          item.gelesen = "";
          document.db.updateItemData(item)
            .catch((error) => { console.error("error", error); reject(error); })
            .then(resolve, reject);
        }
      }
  });
}


/******************************************************************/
/* Database *******************************************************/
/******************************************************************/
document.db =
{
DB_NAME : 'onleihe-extern',
DB_VERSION : 1,
DB_STORE_NAME : 'merkzettel',

openDb : function()
{
  console.log("openDb ...");
  var req = indexedDB.open(this.DB_NAME, this.DB_VERSION);

  req.onupgradeneeded = function (evt)
    {
      // cannot use "this" here, as "this" refers to an IDBOpenDBRequest
      console.log("openDb.onupgradeneeded");
      var store = evt.currentTarget.result.createObjectStore(
          document.db.DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

      store.createIndex('titel', 'titel', { unique: false });
      store.createIndex('url', 'url', { unique: true });
      //store.createIndex('gelesen', 'gelesen', { unique: false });
      console.log("openDb.onupgradeneeded done");
    };

    return new Promise((resolve, reject) =>
      {
        req.onsuccess = () => { console.log("openDb: DONE"); resolve(req.result); }; // returns db
        req.onerror = function() { console.log("openDb: failed"); reject("indexedDB.open failed"); };
      }
      );
},

getObjectStore : function(store_name, mode)
{
  return new Promise((resolve, reject) =>
    {
      this.openDb()
        .catch((error) => { console.error("error", error); reject(error); })
        .then(
          (db) =>
            {
              resolve(db.transaction(store_name, mode).objectStore(store_name));
            },
          (message) =>
            {
              console.log("openDb for store failed", message);
              reject(message);
            }
          )
      ;
    });
},

addTitle : function(titel, url)
{
  console.log("addTitle arguments:", arguments);
  var obj = { titel: titel, url: url, gelesen: false, verfuegbar : null };

  return new Promise((resolve, reject) =>
    {
      this.getObjectStore(this.DB_STORE_NAME, 'readwrite')
        .catch((error) => { console.error("error", error); reject(error); })
        .then(
          (store) =>
            {
              var req = store.add(obj);

              req.onsuccess = function() { console.log("yyy"); resolve(obj); };
              req.onerror = function() { console.log("zzz"); reject("store.add failed"); };
            },
          (message) =>
            {
              console.log("addTitle failed", message);
              reject(message);
            }
          )
    });
},

deleteTitle : function(url)
{
  console.log("deleteTitle arguments:", arguments);

  return new Promise((resolve, reject) =>
    {
      this.getItem(url)
        .catch((error) => { console.error("error", error); reject(error); })
        .then(
          (item) =>
            {
              if(item === undefined)
              {
                reject("getItem returned undefined value");
              }
              else
              {
                console.log("delete key"); console.log(item.id);
                this.deleteKey(item.id)
                  .catch((error) => { console.error("error", error); reject(error); })
                  .then(
                    (value) =>
                      {
                        resolve();
                      },
                    (message) =>
                      {
                        console.log("deleteKey failed", message);
                        reject(message);
                      }
                    )
              }
            },
          (message) =>
            {
              console.log("getItem failed", message);
              reject(message);
            }
          )
        ;
    });
},

deleteKey : function(key)
{
  return new Promise((resolve, reject) =>
    {
      this.getObjectStore(this.DB_STORE_NAME, 'readwrite')
        .catch((error) => { console.error("error", error); reject(error); })
        .then(
          (store) =>
            {
              var req = store.delete(key);

              req.onsuccess = function() { console.log("yyy"); resolve(); };
              req.onerror = function() { console.log("zzz"); reject("store.delete failed"); };
            },
          (message) =>
            {
              console.log("deleteKey failed", message);
              reject(message);
            }
          )
      ;
  });
},

updateItemData: function(item)
{
  return new Promise((resolve, reject) =>
  {
    document.db.updateItem(item)
      .catch((error) => { console.error("error", error); reject(error); })
      .then(
       (value) =>
        {
          var table = $('#merkzettelTable').DataTable({ retrieve: true});
          var rowIndex =
          table.row( function ( idx, data, node )
            {
              return (data[1] === item.url);
            }
          ).index();

          table
            .cell(rowIndex, 2)
            .data(item.verfuegbar);
          table
            .cell(rowIndex, 3)
            .data("" + item.gelesen); // must be text
          // re-apply filter
          console.log("current search", table.column(3).search());

          // redraw, so sorting and filtering is applied to new data
          table.draw();

          resolve(item);
        },
        reject)
  });
 },

alreadySaved : function(url)
{
  return new Promise((resolve, reject) =>
    {
      this.getItem(url)
        .catch((error) => { console.error("error", error); reject(error); })
        .then(
          (item) =>
            {
              resolve((item === undefined) ? false : true);
            },
          (message) =>
            {
              console.log("alreadySaved: failed", message);
              reject(message);
            }
          )
        ;
    }
    );
},

getItem : function(url)
{
  return new Promise((resolve, reject) =>
    {
      this.getObjectStore(this.DB_STORE_NAME, 'readonly')
        .catch((error) => { console.error("error", error); reject(error); })
        .then(
          (store) =>
            {
              var index = store.index("url");
              var res = index.get(url);
              res.onsuccess = () => { resolve(res.result); };
              res.onerror = reject;
            },
          (message) =>
            {
              console.log("getItem: no object store", message);
              reject(message);
            }
          )
        ;
    }
    );
},

getAllItems : function()
{
  var items = new Array(); // needs to be "global", as onsuccess will be called on each record

  return new Promise((resolve, reject) =>
    {
      this.getObjectStore(this.DB_STORE_NAME, 'readonly')
        .catch((error) => { console.error("error", error); reject(error); })
        .then(
          (store) =>
            {
              var request = store.openCursor();
              request.onsuccess = (event) =>
              {
                var cursor = event.target.result;
                if(cursor)
                {
                  items.push(cursor.value);
                  cursor.continue();
                } else {
                  // no more results
                  resolve(items);
                }
              };
              request.onerror = () => { console.log("error opening cursor"); reject(); }
            },
          (message) =>
            {
              console.log("getAllItems: no object store", message);
              reject("store.open failed");
            }
          )
        ;
    }
  );
},

updateItem : function(item)
{
  return new Promise((resolve, reject) =>
    {
      this.getObjectStore(this.DB_STORE_NAME, 'readwrite')
        .catch((error) => { console.error("error", error); reject(error); })
        .then(
          (store) =>
            {
              var request = store.put(item);
              request.onsuccess = (event) =>
              {
                resolve();
              };
              request.onerror = () => { console.log("error updating item", item.id); reject("error updating item"); }
            },
          (message) =>
            {
              console.log("updateItem failed", message);
              reject("store.put failed");
            }
          )
        ;
    }
  );
}

} // object
;
