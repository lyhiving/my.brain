function SearchEngine(){
	var that = this;
	this.search = function(query){
		$.get("actions/search.php", 
				{
					query:query
				},
				function(data){
					$("div#resultsDiv").html(data);
					$(".accordion").accordion({
						collapsible: true,
						autoHeight: false,
						active: 0,
						animated: false
					});
				}
			  );	
		//dans une methode, on utilise that au lieu de this
		//c'est parce que si la m�thode est appel�e de l'ext�rieur, par ex par un bind
		//le this sera une r�f�rence � window et pas � l'objet
	};
}