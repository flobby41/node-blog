function deleteEntry(entryID){
	$.ajax({
        url: '/deleteentry',
        type: 'DELETE',
        data: {"entryid": entryID},
        error: function(result){
            console.log("error: "+result);
        },
        success: function(result){
            console.log("success with: " + result);
            // refresh blogroll
            location.reload();
        }
    });
}

$("#publish-post").click(function(){
    var data = $("#entryform").serializeArray();
    data[1].value = CKEDITOR.instances.newpostContent.getData();
    $.ajax({
        url: '/insertpost',
        type: 'POST',
        data: data,
        error: function(result){
            console.log("error: "+result);
        },
        success: function(result){
            console.log("success with: " + result);
            // here we need to redisplay the blogroll
            // location contains information about current url
            window.location.replace("/");
    }
    });
});


// POST a new entry
// function postEntry(){

// Tab Indents Text in New Post Content Box
$(document).delegate('#newpost-content', 'keydown', function(e) {
  var keyCode = e.keyCode || e.which;

  if (keyCode == 9) {
    e.preventDefault();
    var start = $(this).get(0).selectionStart;
    var end = $(this).get(0).selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    $(this).val($(this).val().substring(0, start)
                + "\t"
                + $(this).val().substring(end));

    // put caret at right position again
    $(this).get(0).selectionStart =
    $(this).get(0).selectionEnd = start + 1;
  }
});
