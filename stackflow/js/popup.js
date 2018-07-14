function show_message(warnning_string){
    $('#debug').html(warnning_string);
}

function getFormattedDateString(text){
    var d = new Date(text);
    var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + 
        d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    return datestring;
}

function hideAllRows(){
    $('#tr_remove_user').hide();
    $('#tr_delete_subject').hide();
    $('#input_text_additional_user_id').val("");
    $('#tr_add_user').hide();
}

document.addEventListener('DOMContentLoaded', function(){
    $('#button_add_new_user').click(function(){
        $('#tr_add_user').show();
        $('#input_text_additional_user_id').focus();
    });
    
    $('#button_remove_current_user').click(function(){
        var n = $('#select_user_name').val();
        
        if (n == null){
            show_message("There is no user to remove.");
            return;
        }
        
        hideAllRows();
        $('#span_confirm_remove_user').html("Are you sure you want to remove user - " + users[n].nthUserName + "?");
        $('#tr_remove_user').show();
    });
    
    $('#input_button_confirm_remove_user').click(function(){
        var n = $('#select_user_name').val();
        var z = users[n].nthUserSubjects.length;
        
        for (var i = 0 ; i < z ; i ++){
            setItem(sKeyGetSubjectUsabilityPrefix + users[n].nthUserSubjects[i].when, NO);
            setItem(sKeyGetSubjectViewStatusPrefix + users[n].nthUserSubjects[i].when, NO);
        }
        
        setItem(sKeyUserLastSubjectIndex + users[n].nthUserID, 0);

        users.splice(n, 1);
        var nextUserIndex = n > users.length - 1 ? users.length - 1 : n;
        
        setItem(sKeyLastUserIndex, nextUserIndex);
        
        hideAllRows();
        saveUsersOnCookie();
        updateSelectLists(nextUserIndex);
    });
    
    $('#button_refull_current_user').click(function(){
        var n = $('#select_user_name').val();

        var z = users[n].nthUserSubjects.length;

        for (var i = 0 ; i < z ; i ++){
            setItem(sKeyGetSubjectUsabilityPrefix + users[n].nthUserSubjects[i].when, NO);
            setItem(sKeyGetSubjectViewStatusPrefix + users[n].nthUserSubjects[i].when, NO);
        }
        
        setItem(sKeyUserLastSubjectIndex + users[n].nthUserID, 0);

        clearInterval(timerId);
        timerId = null;
        
        requestUser(users[n].nthUserID);
        hideAllRows();
    });
    
    $('#input_button_no_remove_user').click(function(){
        hideAllRows();
    });

    $('#button_delete_current_subject').click(function(){
        var n = $('#select_user_name').val();        
        var m = $('#select_subject').val();
        
        if (m == null){
            show_message("There is no subject to delete.");
            return;
        }
        
        hideAllRows();
        $('#span_confirm_delete_subject').html("Are you sure you want to delete subject - " + $('#select_subject').find('option:selected').text() + "?");
        $('#tr_delete_subject').show();
    });
    
    $('#input_button_confirm_delete_subject').click(function(){
        var n = $('#select_user_name').val();        
        var m = $('#select_subject').val();

        setItem(sKeyGetSubjectUsabilityPrefix + users[n].nthUserSubjects[m].when, YES);
        
        hideAllRows();
        updateSelectLists(n);
    });
    
    $('#input_button_no_delete_subject').click(function(){
        hideAllRows();
    });
    
    $('#button_confirm_to_add_user').click(function(){
        if ($('#input_text_additional_user_id').val() == ""){
            show_message("Please type the user id to add.");
            return;
        }
        
        requestUser($('#input_text_additional_user_id').val());
        hideAllRows();
    });
    
    $('#select_user_name').change(function(){
        var n = $('#select_user_name').val();
        setItem(sKeyLastUserIndex, n);
        
        clearInterval(timerId);
        timerId = null;
        
        requestUser(users[n].nthUserID);
        hideAllRows();
    });
    
    $('#select_subject').change(function(){
        var n = $('#select_user_name').val();
        var m = $('#select_subject').val();
        
        setItem(sKeyUserLastSubjectIndex + users[n].nthUserID, m);
        setItem(sKeyGetSubjectViewStatusPrefix + users[n].nthUserSubjects[m].when, YES);
        
        $('#span_from').html(users[n].nthUserName);
        $('#span_when').html(getFormattedDateString(users[n].nthUserSubjects[m].when));
        $('#span_subject').html(users[n].nthUserSubjects[m].subject);
        $('#link_website').html(users[n].nthUserSubjects[m].website);
        $('#link_website').attr("href", users[n].nthUserSubjects[m].website);
        $('#summary').html(users[n].nthUserSubjects[m].summary);
        
        $('#select_subject option[value=' + m + ']').removeClass('option_not_viewed');
        
        $('#table_output').show();
        hideAllRows();
    });
    
    $('#button_cancel_to_add_user').click(function(){
        $('#input_text_additional_user_id').val("");
        hideAllRows();
    });
    
    
//    saveUsersOnCookie();
    getAllUsers();
});

function updateSelectLists(n){
    show_message("");

    if (n < 0){
        $('#select_user_name').html("");
        $('#select_subject').html("");
        $('#table_output').hide();
        hideAllRows();
        return;
    }
    
    var optionCode = "";
    var selectedItem = "";
    
    for (i = 0 ; i < users.length ; i ++){
        if (i == n){
            selectedItem = users[i].nthUserName;
            optionCode += '<option value="' + i + '" name="user_name" selected>' + selectedItem + '</option>';
        } else {
            optionCode += '<option value="' + i + '" name="user_name">' + users[i].nthUserName + '</option>';
        }
    }

    if ($('#select_user_name').find('option:selected').text() != selectedItem)$('#select_user_name').html(optionCode);

    optionCode = "";
    
    var isSelected = false;
    
    var m = getItem(sKeyUserLastSubjectIndex + users[n].nthUserID);
    if (m == null)m = 0;
    
    selectedItem = users[n].nthUserSubjects[0].subject;
    var nCount = 0;
    
    for (j = 0 ; j < users[n].nthUserSubjects.length ; j ++){
        if (getItem(sKeyGetSubjectUsabilityPrefix + users[n].nthUserSubjects[j].when) == YES)continue;
        nCount += getItem(sKeyGetSubjectViewStatusPrefix + users[n].nthUserSubjects[j].when) == YES ? 0 : 1;
        var attachClass = getItem(sKeyGetSubjectViewStatusPrefix + users[n].nthUserSubjects[j].when) == YES ? '' : ' class="option_not_viewed"';
        
        if (j == m || (getItem(sKeyGetSubjectUsabilityPrefix + users[n].nthUserSubjects[m].when) == YES && isSelected == false)){
            selectedItem = users[n].nthUserSubjects[j].subject;
            optionCode += '<option value="' + j + '" name="subject_name" selected' + attachClass + '>' + selectedItem + '</option>';
            isSelected = true;
            m = j;
            setItem(sKeyUserLastSubjectIndex + users[n].nthUserID, j);
        } else {
            optionCode += '<option value="' + j + '" name="subject_name"' + attachClass + '>' + users[n].nthUserSubjects[j].subject + '</option>';
        }
    }
    
    if ($('#select_subject').find('option:selected').text() != selectedItem || nCount != $('.option_not_viewed').length)$('#select_subject').html(optionCode);

    if (optionCode == ""){
        $('#table_output').hide();
        hideAllRows();
        return;
    }
    
    $('#span_from').html(users[n].nthUserName);
    $('#span_when').html(getFormattedDateString(users[n].nthUserSubjects[m].when));
    $('#span_subject').html(users[n].nthUserSubjects[m].subject);
    $('#link_website').html(users[n].nthUserSubjects[m].website);
    $('#link_website').attr("href", users[n].nthUserSubjects[m].website);
    if ($('#summary').html != users[n].nthUserSubjects[m].summary)$('#summary').html(users[n].nthUserSubjects[m].summary);
    
    $('#table_output').show();
    $('#table_output').height($('#table_input').height());

    if (timerId == null){
        timerId = setInterval(function () {sendRequestByRealTime();}, timeInterval);
    }
}

function parseXML(xml, nIndex, userID) {
    var subjects = [];
    
    var newUserName = "";
    var x, y, i, j, k, z = 0, xmlDoc, txt;
    xmlDoc = xml.responseXML;
    x = xmlDoc.documentElement;
    y = xmlDoc.documentElement.childNodes;
    
    for(i = 0; i < y.length; i++) {
        if (y[i].childNodes.length > 0 && y[i].nodeName == "entry") {
            var subject = {"subject" : "", "summary" : "", "when" : "", "website" : ""};
            for(j = 0; j < y[i].childNodes.length; j++) {
                if (y[i].childNodes[j].nodeType != 3) {
                    if (y[i].childNodes[j].nodeName == "title"){
                        subject.subject = y[i].childNodes[j].childNodes[0].nodeValue;
                    } else if(y[i].childNodes[j].nodeName == "author"){
                        if (newUserName == ""){
                            for(k = 0; k < y[i].childNodes[j].childNodes.length; k++) {
                                if (y[i].childNodes[j].childNodes[k].nodeName == "name"){
                                    newUserName = y[i].childNodes[j].childNodes[k].childNodes[0].nodeValue;
                                    continue;
                                }
                            }
                        }
                    } else if (y[i].childNodes[j].nodeName == "link"){
                        subject.website = y[i].childNodes[j].getAttribute('href');
                    } else if (y[i].childNodes[j].nodeName == "updated"){
                        subject.when = y[i].childNodes[j].childNodes[0].nodeValue;
                    } else if (y[i].childNodes[j].nodeName == "summary"){
                        subject.summary = y[i].childNodes[j].childNodes[0].nodeValue;
                    }
                }
            }
            subjects[z++] = subject;
        }
    }
    
    for (i = 0 ; i < z - 1 ; i ++){
        var timestamp1 = new Date(subjects[i].when).getTime();
        for (j = i + 1 ; j < z ; j ++){
            var timestamp2 = new Date(subjects[j].when).getTime();
            
            if (timestamp1 < timestamp2){
                timestamp1 = timestamp2;
                timestamp2 = new Date(subjects[i].when).getTime();
                var subject = subjects[i];
                subjects[i] = subjects[j];
                subjects[j] = subject;
            }
        }
    }
    
    users[nIndex] = {"nthUserSubjects" : subjects, "nthUserID" : userID, "nthUserName" : newUserName};
    
    z = users.length;
    
    for (i = 0 ; i < z - 1 ; i ++){
        var userName1 = users[i].nthUserName.toLowerCase();
        for (j = i + 1 ; j < z ; j ++){
            var userName2 = users[j].nthUserName.toLowerCase();
            
            if (userName1 > userName2){
                userName1 = userName2;
                userName1 = users[i].nthUserName.toLowerCase();
                var user = users[i];
                users[i] = users[j];
                users[j] = user;
            }
        }
    }
    
    for (i = 0 ; i < z ; i ++){
        if (users[i].nthUserID == userID)break;
    }
    
    saveUsersOnCookie();
    updateSelectLists(i);
}

function requestUser(userID){
    var i = 0;
    for (i = 0 ; i < users.length ; i ++){
        if (users[i].nthUserID == userID)break;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            parseXML(xhttp, i, userID);
        } else {
        }
    }
    xhttp.open("GET", "http://stackoverflow.com/feeds/user/" + userID, true);
    xhttp.send();
}

function sendRequestByRealTime(){
    if ($('#select_user_name').val() == null)return;
    requestUser(users[$('#select_user_name').val()].nthUserID);
}

function getAllUsers(){
    var nUserCount = getItem(sKeyTotalUserCounts);
    if (nUserCount == null)return;
    
    for (i = 0 ; i < nUserCount ; i ++){
        users[i] = {"nthUserSubjects" : [], "nthUserID" : getItem(sKeyUserIDIndexPrefix + i), "nthUserName" : getItem(sKeyUserNameIndexPrefix + i)};
    }
    
    var n = getItem(sKeyLastUserIndex);
    
    if (n == null)n=0;

    requestUser(users[n].nthUserID);
    
    timerId = setInterval(function () {sendRequestByRealTime();}, timeInterval);
}

function saveUsersOnCookie(){
    setItem(sKeyTotalUserCounts, users.length);

    for (i = 0 ; i < users.length ; i ++){
        setItem(sKeyUserIDIndexPrefix + i, users[i].nthUserID);
        setItem(sKeyUserNameIndexPrefix + i, users[i].nthUserName);
    }
}

function setItem(key, value) {
    try {
      log("Inside setItem:" + key + ":" + value);
      window.localStorage.removeItem(key);
      window.localStorage.setItem(key, value);
    }catch(e) {
      log("Error inside setItem");
      log(e);
    }
    log("Return from setItem" + key + ":" +  value);
}

function getItem(key) {
    var value;
    log('Get Item:' + key);
    try {
      value = window.localStorage.getItem(key);
    }catch(e) {
      log("Error inside getItem() for key:" + key);
      log(e);
      value = "null";
    }
    log("Returning value: " + value);
    return value;
}

function clearStrg() {
    log('about to clear local storage');
    window.localStorage.clear();
    log('cleared');
}

function log(txt) {
}
