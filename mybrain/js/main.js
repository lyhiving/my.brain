
/**
* Remove escaping characters from a string
*/
function unescapeText(text){
	// Escaped " or ' => remove all \
	text = text.replace(/(\\)+((&#039;)|(&quot;))/g, "$2");
	// Escaped \ => remove all \ but one
	text = text.replace(/(\\)+/g, "\\");
	return text;
}
/**
* Called by the "edit" link of an entry : retrieve entry from db and draw the edition form
*
* @param obj => a dom element from inside the entry row
*/
function editEntry(obj) {
	
	var div_entry = $(obj).parents("div.entryBody");
	var id_entry = div_entry.attr("name");
	
	$.post("actions/getEntryFromDb.php", 
		{
			id_entry:id_entry
		},
		function(data){
			data["details"] = unescapeText(data["details"]);
			drawEditEntry(data, div_entry);
			div_entry.find("input[name='entry_name']").focus();
			var accept = div_entry.find("img")[0];
			// Enter key validates the form if focus is on any input field,
			// but not if it's on textarea: it's still newline
			div_entry.find("input").keydown(function(event){
				if (event.keyCode == 13){
					$(accept).click();
				}
			});
		},
		"json"
	  );	
}

/**
* Display an edit form
*
* @param data => an array containing the content of the entry as retrieved from db
* @param tr => the row where the form will be inserted
*/
function drawEditEntry(data, div_entry){	
	var html = "<div class='editForm'><form><table class='edit_table'>"
					 + "<tr><td><label for='entry_name'>Name </label></td><td><input name='entry_name' value='" + data['name'] + "' /></td></tr>"
					 + "<tr><td><label for='entry_url'>Url </label></td><td><input name='entry_url' value ='" + data['url'] + "' /></td></tr>"
					 + "<tr><td><label for='entry_details'>Details </label></td><td><textarea name='entry_details'>" + data['details'] + "</textarea></td></tr>"
					 + "<tr><td><label for='entry_tags'>Tags</label></td><td><input name='entry_tags' value='" + data['tags'] + "'/></td></tr></table>"
					 + "<img src='images/accept.png' alt='Create' onclick='updateEntryInDb(this)' class='imgAccept'/>"
					 + "<img src='images/cross.png' alt='Cancel' onclick='cancelEdit(this)' class='imgAccept'/></form></div>";
					
	div_entry.html(html);
}

/**
* Called by the "cancel" link of an entry edit form : cancel the edit and reset the entry display
*
* @param obj  => a dom element from inside the entry row
*/
function cancelEdit(obj){
	var tr = $(obj).parents("tr");
	var id_entry = tr.attr("name");
	refreshEntry(id_entry, obj);
}

/**
* Display a new entry form
*
* @param obj  => a dom element from inside the new entry row
*/
function newEntry(obj){
	var title_div = $(obj).parents("div.entryTitle");
	var accordion = title_div.next().find("div.accordion");

	/* If a new entry doesn't exists already, create one */
	if (!accordion.find(".newAccordionEntry").length){
		var default_tags = $(title_div).parents("div.entryList").find("span.tag_header").html();
		
		var html = "<h3 class='accordion newAccordionEntry'><a href='#'>New entry</a></h3>"
						 + "<div class='editForm'><form><table class='edit_table'><tr><td><label for='entry_name'>Name </label></td><td><input name='entry_name' /></td></tr>"
						 + "<tr><td><label for='entry_url'>Url </label></td><td><input name='entry_url' /></td></tr>"
						 + "<tr><td><label for='entry_details'>Details </label></td><td><textarea name='entry_details'></textarea></td></tr>"
						 + "<tr><td><label for='entry_tags'>Tags</label></td><td><input name='entry_tags' value=" + default_tags + "/></td></tr></table>"
						 + "<img src='images/accept.png' alt='Create' onclick='writeEntryToDb(this)' class='imgAccept'/>"
						 + "<img src='images/cross.png' alt='Cancel' onclick='cancelNew(this)' class='imgAccept'/></form></div>";
						
		accordion.append(html);
		
		/* Reset accordion */
		accordion.accordion('destroy').accordion({
				collapsible: true,
				autoHeight: false,
				active: false});
				
		/* Open the entry */
		accordion.accordion("activate", accordion.find(".newAccordionEntry"));
	}
}

/**
* Toggle the display of the "details" field for an entry
*
* @param obj => a dom element from inside the entry row
*/
function more(obj) {
	var tr = $(obj).parents("tr");
	var text = tr.find(".moreText");
	var arrow = tr.find(".entryIcon:eq(1)");

	if (text.css("display") == "inline"){	
		arrow.attr("src", "images/double_down.png")
	}else{
		arrow.attr("src", "images/double_up.png")
	}
	text.toggle();
}

/**
* Write a new entry to db and call a function to refresh the view
*
* @param obj => a dom element from inside the new entry row
*/
function writeEntryToDb(obj) {
	var new_entry_form = $(obj).parents("form");
	var id_list = 0;
	var input_fields = new_entry_form.find(":input");
	
	$.post("actions/writeEntryToDb.php", 
			{
				id_list:id_list, 
				name:input_fields[0].value,
				url:input_fields[1].value, 
				details:input_fields[2].value,
				tags:input_fields[3].value
			},
			function(data){
				//refreshEntryAfterAdd(data['id_entry'], new_entry_form);
				refreshEntry(data['id_entry'], new_entry_form, "add");
			},
			"json"
		  );	
	return false;
}

/**
 * Display the new entry in place and an 'add new entry' button afterwards
 * 
 * @param id_entry => the new entry id
 * @param obj => a dom element from inside the new entry row
 */
function refreshEntryAfterAdd(id_entry, obj) {
	$.post("actions/getEntryFromDb.php", 
			{
				id_entry:id_entry
			},
			function(data){
				drawEntry(data, obj);
			},
			"json"
		  );	
	/*	  
	html_add_entry = "<tr>" +
					 "<td class='newEntryCell' width='100%'>" +
					 "<img src='images/text_plus.png' alt='new' onclick='newEntry(this)'/>" +
					 "</td>" +
					 "</tr>";

	if (!$(obj).is("tr")){
		obj = $(obj).parents("tr");
	}

	obj.after(html_add_entry);*/
}

/**
 * Retrieve an entry data and display it in place
 * 
 * @param id_entry => the entry id
 * @param obj => a dom element from inside the entry row
 */
function refreshEntry(id_entry, obj, context) {

	$.post("actions/getEntryView.php", 
			{
				id_entry:id_entry
			},
			function(data){	
				if (context == "edit"){
					drawEntryAfterEdit(id_entry, data, obj);
				}
				else if (context == "add"){
					drawEntry(data, obj);
				}
			}
		  );	
}

/**
* Display an entry in place after an edit
*
* @param data => an array containing the content of the entry as retrieved from db
* @param obj => a dom element from inside the entry row
*/
function drawEntryAfterEdit(id_entry, data, obj) {
	
	// An entry can be displayed more than once the page,
	// so we make sure we update them all.
	var entries_h3 = $("h3." + id_entry + " a");
	var entries_bodies = $("div." + id_entry);
	
	var elements = $(data);
	entries_h3.html(elements.filter("#h3_replace").html());

	entries_bodies.empty().append(elements.filter(":not(#h3_replace)"));

/*
	var html_h3 = "<h3><a href='#'>" + data['name'] + "</a></h3>";
	
	var html_bodies = "<a class='url' href=''>"  + data['url'] + " Go to url</a>"
					  + "<p>" + data['details'] + "</p>"
					  + "</div>";
*/
	//entry_body.html(html);

	//edit_div.html()
	/* Insert new entry and reset accordion */
	//accordion.append(html).accordion('destroy').accordion();

	/*
	if (!$(obj).is("tr")){
		obj = $(obj).parents("tr");
	}
	
	html_entry ="<tr class='entryRow' name='" + data['id_entry'] + "'>" +
				"<td class='entryCell'>" +
					"<a href='" + data['url'] + "'>" + data['name'] + "</a>" +													
					"<textarea class='moreText' style='display: none;'>" + data['details'] + "</textarea>" +
					"<div class='tags'>" + data['tags'] + "</div>" +
				"</td>" + 
				"<td class='iconCell'>" +
					"<img onclick=\"window.open('zoom_popup.php?id_entry=" + data['id_entry'] + "','popup','resizable=no,scrollbars=no,width=600,height=370');\" alt='zoom' src='images/zoom.png' class='entryIcon'/>" +
				"</td>" + 
				"<td class='iconCell'>" +
					"<img onclick='more(this)' alt='more' src='images/double_down.png' class='entryIcon'/>" +
				"</td>" +
				"<td class='iconCell'>" +
					"<img onclick='editEntry(this)' alt='edit' src='images/pencil.png' class='entryIcon'/>" +
				"</td>" +
				"<td class='iconCell'>" +
					"<img onclick='deleteEntry(this)' alt='delete' src='images/text_minus.png' class='entryIcon' name='" + data['id_entry'] + "'/>" +
				"</td></tr>";
	obj.replaceWith(html_entry);
	obj.find("tr.entryRow").effect("highlight",{color:'#3DFF8C'},2000);*/
}


/**
* Display an entry in place
*
* @param data => an array containing the content of the entry as retrieved from db
* @param obj => a dom element from inside the entry row
*/
function drawEntry(data, obj) {
	console.log("ici");
	var entry_block = getEntryBlock(obj);
	var edit_div = $(obj).parents("div.editForm");
	var edit_h3 = edit_div.prev();
	var accordion = edit_div.parents("div.entryContent").find("div.accordion");
/*
	data["details"] = unescapeText(data["details"]);

	html_h3 = "<h3><a href='#'>" + data['name'] + "</a></h3>";
	
	html_div = "<div name = " + data['id_entry'] + ">"
			   + "<a class='url' href=''>"  + data['url'] + " Go to url</a>"
			   + "<p>" + data['details'] + "</p>"
			   + "</div>";

	
	edit_h3.replaceWith(html_h3);
	edit_div.replaceWith(edit_h3);*/
	
	edit_h3.remove();
	edit_div.remove();
	accordion.append(data);
	
	/* Reset accordion */
	accordion.accordion('destroy').accordion({
			collapsible: true,
			autoHeight: false,
			active: false});
			
	/* Open the entry */
	//accordion.accordion("activate", accordion.find(".newAccordionEntry"));
	
	//console.log(getEntryBlock(obj)["h3"]);
	//edit_div.html()
	/* Insert new entry and reset accordion */
	//accordion.append(html).accordion('destroy').accordion();

	/*
	if (!$(obj).is("tr")){
		obj = $(obj).parents("tr");
	}
	
	html_entry ="<tr class='entryRow' name='" + data['id_entry'] + "'>" +
				"<td class='entryCell'>" +
					"<a href='" + data['url'] + "'>" + data['name'] + "</a>" +													
					"<textarea class='moreText' style='display: none;'>" + data['details'] + "</textarea>" +
					"<div class='tags'>" + data['tags'] + "</div>" +
				"</td>" + 
				"<td class='iconCell'>" +
					"<img onclick=\"window.open('zoom_popup.php?id_entry=" + data['id_entry'] + "','popup','resizable=no,scrollbars=no,width=600,height=370');\" alt='zoom' src='images/zoom.png' class='entryIcon'/>" +
				"</td>" + 
				"<td class='iconCell'>" +
					"<img onclick='more(this)' alt='more' src='images/double_down.png' class='entryIcon'/>" +
				"</td>" +
				"<td class='iconCell'>" +
					"<img onclick='editEntry(this)' alt='edit' src='images/pencil.png' class='entryIcon'/>" +
				"</td>" +
				"<td class='iconCell'>" +
					"<img onclick='deleteEntry(this)' alt='delete' src='images/text_minus.png' class='entryIcon' name='" + data['id_entry'] + "'/>" +
				"</td></tr>";
	obj.replaceWith(html_entry);
	obj.find("tr.entryRow").effect("highlight",{color:'#3DFF8C'},2000);*/
}

/**
* Write the memo to db
*/
function writeMemoToDb() {
	var memo = document.getElementById("memo");
	var container = $('#message_memo');
	
	// memo is empty ? Maybe something went wrong, cancel !
	if (!memo.value){
		container.html("Save cancelled: memo is empty !").effect('highlight',{color:'#c00'},2000);
		return;
	}
	
    $.ajax({
		type: "POST",
        url: "actions/writeMemoToDb.php",
		data: {content: memo.value},
        success: function(data){
          container.html(data).
            effect("highlight",{color:'#3DFF8C'},2000);
        },
        error: function(req,error){
          if(error === 'error'){error = req.statusText;}
          var errormsg = 'Saved cancelled: '+error;
          container.html(errormsg).
            effect('highlight',{color:'#c00'},2000);
        },
        beforeSend: function(data){
          container.html('Saving...');
        }
    });

	//$.post("actions/writeMemoToDb.php", {content: memo.value});
}

/**
* Remove an entry from db and from display
*
* @param obj => a dom element from inside the entry row
*/
function deleteEntry(obj) {
	var div_entry = $(obj).parents("div.entryBody");
	var id = div_entry.attr("name");

	$.post("actions/deleteEntryFromDb.php", {id: id});
	
	// The entry can be displayed more than once
	// so we make sure all of them are removed from display
	$("." + id).remove();
}

/**
* Called by the entry edit form "accept" link : update an entry in db then refresh the view
*
* @param obj => a dom element from inside the entry row
*/
function updateEntryInDb(obj){
	/*var tr = $(obj).parents("tr");
	var id = tr.attr("name");
	var input_fields = tr.find(":input");*/
	
	var div_entry = $(obj).parents("div.entryBody");
	var id_entry = div_entry.attr("name");
	var input_fields = div_entry.find(":input");

	$.post("actions/updateEntryInDb.php", 
			{
				id_entry:id_entry,
				name:input_fields[0].value,
				url:input_fields[1].value, 
				details:input_fields[2].value,
				tags:input_fields[3].value
			},
			function(data){
				refreshEntry(id_entry, obj, "edit");	
			},
			"json"
		  );			  
}

/**
* Called by the entry edit form "cancel" link : cancel the creation of an entry -> remove the form
*
* @param obj => a dom element from inside the entry row
*/
function cancelNew(obj){
	html_add_entry = "<tr>" +
					 "<td class='newEntryCell' width='100%'>" +
					 "<img src='images/text_plus.png' alt='new' onclick='newEntry(this)'/>" +
					 "</td>" +
					 "</tr>";
	$(obj).parents("tr").replaceWith(html_add_entry);
}

/**
* Bind javascript events to the main view
*/
function bindEvents(){
	/* Setup accordion */
	$(".accordion").accordion({
		collapsible: true,
		autoHeight: false,
		active: false,
		animated: false
	});

	/* Draw pretty corners */
	$(".entryList").corner("5px");
	$("#memo").corner("5px");
	$("#header").corner("5px");
	
	/* Bind tag toggle on click */
	$("td.tags span").click(function(){
		toggleTag($(this));
	});
	
	/* Bind create new entry on click */
	$("a.newEntry").click(function(){
		newEntry(this);
		return false;
	});
	
	/* Bind delete entry on click */
	$("a.deleteEntry").click(function(){
		deleteEntry(this);
		return false;
	});

	/* Bind open zoom window on click*/
	$("a[rel]").click(function() {
		$("<div class='apple_overlay'></div>")
			.load($(this).attr('href'))
			.dialog({
				autoOpen: false,
				draggable: false,
				title: $(this).attr('title'),
				width: 500,
				height: 300
			}).dialog('open');	
			
		return false;
	});
	
	/* Bind toggle list on click */
	$(".tdListTitle").click(function() {
		moreEntryList(this);
		return false;
	});
	
	/* Bind edit list on click */
	$("a.editList").click(function(){
		editEntryList(this);
		return false;
	});
}

/**
* For a given tag element, toggle the display of entries linked with this tag
* If the tag value is "all" or "none", call the toggleAll function instead
*
* @param tag => the tag as a string
*/
function toggleTag(tag){
	tag_text = jQuery.trim(tag.html());
	entry_list = tag.parents(".entryList");
	entry_list.find("div.accordion").accordion('activate', false);
	if (tag_text == "all" || tag_text == "none"){
		toggleAllTags(tag_text, entry_list);
		return;
	}
	if (tag_text.match(new RegExp('<img'))){
		toggleEntryTags(entry_list);
		return;
	}

	// toggle the tag in the list header
	tag.toggleClass("selected");
	
	// for each entry with the tag
	entries = entry_list.find("div.tags span:contains(" + tag_text + ")");
	entries.each(function(){
		// if the entry has other tags, we have to check if the entry is to be toggled
		siblings = $(this).siblings("span");
		if (siblings.length){
			// if any other tag is selected, then changing this tag doesn't affect the entry visibility
			var state = false;
			siblings.each(function(){
				tag_sibling = $(this).html();
				selected = entry_list.find("td.tags span:contains(" + tag_sibling + ")").hasClass("selected");
				if (selected){
					state = true;
					return false;
				}
			});
			// no other tag is selected : the tag toggle affects the entry visibility
			if (!state){
				$(this).parents("div.entryBody").prev().toggle();
			}
		}
		// no other tag ? toggle !
		else{	
			$(this).parents("div.entryBody").prev().toggle();
		}
	});
}
/**
* Toggle the display of all tags at once :
* hide all tags, or show all tags
*
* @param tag_text the tag switch as a string : "all", or "none"
* @param entry_list the entry list as a dom element
*/
function toggleAllTags(tag_text, entry_list){
	tagged_entries = entry_list.find("div.tags span:not(:empty)").parents("div.entryBody").prev();
	tag_headers = entry_list.find("span.tag_header");
	if (tag_text == "none"){
		tagged_entries.hide();
		tag_headers.removeClass("selected");
	}
	else{
		tagged_entries.show();
		tag_headers.addClass("selected");
	}	
}

function toggleEntryTags(entry_list){
	entry_list.find("div.tags span:not(:empty)").toggleClass("hidden");
}

function editEntryList(obj){
	var tr = $(obj).parents("tr");
	var id_list = tr.attr("name");
	
	$.post("actions/getEntryListFromDb.php", 
		{
			id_list:id_list
		},
		function(data){
			drawEditEntryList(data, tr);
			tr.find("input[name='entry_name']").focus();
			var accept = tr.find("img")[0];
			// Enter key validates the form if focus is on any input field,
			// but not if it's on textarea: it's still newline
			tr.find("input").keydown(function(event){
				if (event.keyCode == 13){
					$(accept).click();
				}
			});
		},
		"json"
	  );	
}

function drawEditEntryList(data, tr){
	html = "<td colspan=4><form><table class='edit_table'>"
			 + "<tr><td><label for='list_title' class='label_edit'>Title </label></td><td><input name='list_title' value='" + data['title'] + "' /></td></tr>"
			 + "<tr><td><label for='list_col' class='label_edit'>Column </label></td><td><input name='col' value ='" 
			 + data['col'] + "' /></td></tr>"
			 + "<tr><td><label for='list_rank' class='label_edit'>Rank </label></td><td><input name='list_rank' value='" 
			 + data['rank'] + "' /></td></tr>" 
			 + "<tr><td><label for='list_rank' class='label_edit'>Tags </label></td>"
			 + "<td><input name='list_tags' value='" 
			 + data['tags'] + "' /></td></tr>" 
			// + "<td class='tags' colspan=2></td></tr>"
			 + "</table>"
			 + "<img src='images/accept.gif' alt='Create' onclick='updateEntryList(this)' class='imgAccept'/>"
			 + "<img src='images/cross.png' onclick='cancelEditEntryList(this)' alt='Cancel' class='imgAccept'/></form></td>";
	tr.html(html);
	
	getAllTags(tr.find("td.tags"), tr.attr("name"));
}

function updateEntryList(obj){
	var tr = $(obj).parents("tr");
	var id = tr.attr("name");
	var input_fields = tr.find(":input");

	$.post("actions/updateEntryListInDb.php", 
			{
				id_list:id,
				title:input_fields[0].value,
				col:input_fields[1].value, 
				rank:input_fields[2].value,
				tags:input_fields[3].value
			},
			function(){
				refreshEntryList(id, obj);	
			}
		  );			  
}

function refreshEntryList(id_list, obj) {
	$.post("actions/getEntryListFromDb.php", 
			{
				id_list:id_list
			},
			function(data){
				drawEntryList(data, obj);
			},
			"json"
		  );	
}

function drawEntryList(data, obj) {
	if (!$(obj).is("tr")){
		obj = $(obj).parents("tr");
	}

	html_list ="<tr name='" + data['id_list'] + "'>" +
				"<td >" +
					data['title'] +													
				"</td>" + 
				"<td class='iconCell'>" +
					"<img onclick='moreEntryList(this)' alt='more' src='images/double_down.png' class='entryIcon'/>" +
				"</td>" +
				"<td class='iconCell'>" +
					"<img onclick='editEntryList(this)' alt='edit' src='images/pencil.png' class='entryIcon'/>" +
				"</td>" +
				"<td class='iconCell'>" +
					"<img onclick='deleteEntryList(this)' alt='delete' src='images/text_minus.png' class='entryIcon' name='" + data['id_list'] + "'/>" +
				"</td>";
	obj.replaceWith(html_list);
}

/**
* Cancel the edit of an entry list and restore the display
*/
function cancelEditEntryList(obj){
	var tr = $(obj).parents("tr");
	var id_list = tr.attr("name");
	refreshEntryList(id_list, obj);
}

/**
* Toggle an entire entry list
*/
function moreEntryList(obj) {
	var content = $(obj).parents("div.entryList").find("div.entryContent");
	// toggle the tag headers
	$(obj).parents("tr").siblings(":first").toggle();

	var collapsed = 0;
	// toggle the arrow image
	if (content.css("display") == "block"){	
		collapsed = 1;
		$(obj).attr("src", "images/double_down.png")
	}else{
		$(obj).attr("src", "images/double_up.png")
	}
	// toggle the entries
	content.toggle();
	
	// Update collapsed bool in db
	var tr = $(obj).parents("tr");
	var id = tr.attr("name");
	$.post("actions/updateEntryListCollapse.php", 
			{
				id_list:id,
				collapsed:collapsed
			}
		  );		
}

/**
* Delete an entry list
*/
function deleteEntryList(obj){
	var tr = $(obj).parents("tr");
	var id = tr.attr("name");

	var html = "<td>Delete this list ? " +
				"<a href='javascript:confirmDeleteEntryList(this)'>Yes</a>" +
				"<a href='javascript:cancelEditEntryList(this)'>No</a>" +
				"</td>";
	tr.html(html);
	//$.post("actions/deleteEntryFromDb.php", {id: id});
	//tr.remove();
}

function getAllTags(obj, id_list){
console.log($(obj).parents("td"));
	$(obj).load("actions/getAllTagsFromDb.php", {"id_list":1});
	/*var a = $.ajax({url:"actions/getAllTagsFromDb.php",
					type:		'POST',
	cache:		false,
	asynch:		false,
}).responseText;
	console.log(a);*/
}

function getEntryBlock(obj){
	var div_entry = $(obj).parents("div.entryBody");
	// il faut reussir a le faire avec un truc genre previous sibling
	var id_entry = div_entry.attr("name");
	var h3_entry = $("h3." + id_entry);
	return {"h3":h3_entry, "div":div_entry};
}

