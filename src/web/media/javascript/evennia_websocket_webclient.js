/*

Evennia websocket webclient (javascript component)

The client is composed of several parts:
 templates/webclient.html - the main page
 webclient/views.py - the django view serving the template (based on urls.py pattern)
 src/server/portal/websockets.py - the server component talking to the client
 this file - the javascript component handling dynamic content

This implements an mud client for use with Evennia, using jQuery
for simplicity.

messages sent to the client is one of three modes:
  OOB(func,(args), func,(args), ...)  - OOB command executions
  text - any other text is considered a normal text to echo

*/

// jQuery must be imported by the calling html page before this script
// There are plenty of help on using the jQuery library on http://jquery.com/

// Server communications
// Set this to the value matching settings.WEBSOCKET_PORTS
var wsurl = "ws://localhost:8001";

function webclient_init(){
    // initializing the client once the html page has loaded
    websocket = new WebSocket(wsurl);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
    // client is just connecting
    $("#connecting").remove(); // remove the "connecting ..." message
    msg_display("sys", "Using websockets - connected to " + wsurl + ".")

    setTimeout(function () {
        $("#playercount").fadeOut('slow', webclient_set_sizes);
    }, 10000);
}

function onClose(evt) {
    // client is closing
    CLIENT_HASH = 0;
    alert("Mud client connection was closed cleanly.");
}

function onMessage(evt) {
    // outgoing message from server
    var inmsg = evt.data
    if (inmsg.length > 3 && inmsg.substr(0, 3) == "OOB") {
        // dynamically call oob methods, if available
        try {var oobarray = JSON.parse(inmsg.slice(3));} // everything after OOB }
        catch(err) {
            // not JSON packed - a normal text
            msg_display('out', err + " " + inmsg);
            return;
        }
        for (var ind in oobarray) {
            try { window[oobarray[ind][0]](oobarray[ind][1]) }
            catch(err) { msg_display("err", "Could not execute OOB function " + oobtuple[0] + "(" + oobtuple[1] + ")!") }
        }
    }
    else {
        // normal message
        msg_display('out', inmsg); }
}

function onError(evt) {
    // client error message
    msg_display('err', "Error: Server returned an error. Try reloading the page.");
}

function doSend(){
    // sending data from client to server
    outmsg = $("#inputfield").val();
    history_add(outmsg);
    HISTORY_POS = 0;
    $('#inputform')[0].reset();                     // clear input field

    if (outmsg.length > 4 && outmsg.substr(0, 5) == "##OOB") {
        // test OOB messaging
        doOOB(JSON.parse(outmsg.slice(5))); }
    else {
        websocket.send(outmsg); }
}

function doOOB(oobdict){
    // Handle OOB communication from client side
    // Takes a dict on form {funcname:[args], funcname: [args], ... ]
    msg_display("out", "into doOOB: " + oobdict)
    msg_display("out", "stringify: " + JSON.stringify(oobdict))
    var oobmsg = JSON.stringify(oobdict);
    websocket.send("OOB" + oobmsg);
}


//
// OOB functions
//

function echo(message) {
    msg_display("out", "ECHO return: " + message) }

//
// Display messages

function msg_display(type, msg){
    // Add a div to the message window.
    // type gives the class of div to use.
    $("#messagewindow").append(
        "<div class='msg "+ type +"'>"+ msg +"</div>");
    // scroll message window to bottom
    $('#messagewindow').animate({scrollTop: $('#messagewindow')[0].scrollHeight});
}

// Input history mechanism

var HISTORY_MAX_LENGTH = 21
var HISTORY = new Array();
HISTORY[0] = '';
var HISTORY_POS = 0;

function history_step_back() {
    // step backwards in history stack
    HISTORY_POS = Math.min(++HISTORY_POS, HISTORY.length-1);
    return HISTORY[HISTORY.length-1 - HISTORY_POS];
}
function history_step_fwd() {
    // step forward in history stack
    HISTORY_POS = Math.max(--HISTORY_POS, 0);
    return HISTORY[HISTORY.length-1 - HISTORY_POS];
}
function history_add(input) {
    // add an entry to history
    if (input != HISTORY[HISTORY.length-1]) {
        if (HISTORY.length >= HISTORY_MAX_LENGTH) {
            HISTORY.shift(); // kill oldest history entry
        }
        HISTORY[HISTORY.length-1] = input;
        HISTORY[HISTORY.length] = '';
    }
}

// Catching keyboard shortcuts

$.fn.appendCaret = function() {
    /* jQuery extension that will forward the caret to the end of the input, and
       won't harm other elements (although calling this on multiple inputs might
       not have the expected consequences).

       Thanks to
       http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
       for the good starting point.  */
    return this.each(function() {
        var range,
            // Index at where to place the caret.
            end,
            self = this;

        if (self.setSelectionRange) {
            // other browsers
            end = self.value.length;
            self.focus();
            // NOTE: Need to delay the caret movement until after the callstack.
            setTimeout(function() {
                self.setSelectionRange(end, end);
            }, 0);
        }
        else if (self.createTextRange) {
            // IE
            end = self.value.length - 1;
            range = self.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', end);
            // NOTE: I haven't tested to see if IE has the same problem as
            // W3C browsers seem to have in this context (needing to fire
            // select after callstack).
            range.select();
        }
    });
};
$.fn.appendCaret = function() {
    /* jQuery extension that will forward the caret to the end of the input, and
       won't harm other elements (although calling this on multiple inputs might
       not have the expected consequences).

       Thanks to
       http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
       for the good starting point.  */
    return this.each(function() {
        var range,
            // Index at where to place the caret.
            end,
            self = this;

        if (self.setSelectionRange) {
            // other browsers
            end = self.value.length;
            self.focus();
            // NOTE: Need to delay the caret movement until after the callstack.
            setTimeout(function() {
                self.setSelectionRange(end, end);
            }, 0);
        }
        else if (self.createTextRange) {
            // IE
            end = self.value.length - 1;
            range = self.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', end);
            // NOTE: I haven't tested to see if IE has the same problem as
            // W3C browsers seem to have in this context (needing to fire
            // select after callstack).
            range.select();
        }
    });
};

$(document).keydown( function(event) {
    // Get the pressed key (normalized by jQuery)
    var code = event.which,
        inputField = $("#inputfield");

    // always focus input field no matter which key is pressed
    inputField.focus();

    // Special keys recognized by client

    //msg_display("out", "key code pressed: " + code); // debug

    if (code == 13) { // Enter Key
        doSend();
        event.preventDefault();
    }
    else {
        if (code == 38) { // arrow up 38
            inputField.val(history_step_back()).appendCaret();
        }
        else if (code == 40) { // arrow down 40
            inputField.val(history_step_fwd()).appendCaret();
        }
    }
});

// handler to avoid double-clicks until the ajax request finishes
//$("#inputsend").one("click", webclient_input)

function webclient_set_sizes() {
    // Sets the size of the message window
    var win_h = $(document).height();
    //var win_w = $('#wrapper').width();
    var inp_h = $('#inputform').outerHeight(true);
    //var inp_w = $('#inputsend').outerWidth(true);

    $("#messagewindow").css({'height': win_h - inp_h - 1});
    //$("#inputfield").css({'width': win_w - inp_w - 20});
}


// Callback function - called when page has finished loading (gets things going)
$(document).ready(function(){
    // remove the "no javascript" warning, since we obviously have javascript
    $('#noscript').remove();
    // set sizes of elements and reposition them
    webclient_set_sizes();
    // a small timeout to stop 'loading' indicator in Chrome
    setTimeout(function () {
        webclient_init();
    }, 500);
    // set an idle timer to avoid proxy servers to time out on us (every 3 minutes)
    setInterval(function() {
        webclient_input("idle", true);
    }, 60000*3);
});

// Callback function - called when the browser window resizes
$(window).resize(webclient_set_sizes);

// Callback function - called when page is closed or moved away from.
//$(window).bind("beforeunload", webclient_close);
