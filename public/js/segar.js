function toggleCatalogs(){
	document.getElementById('div-catalogs').style.display = 'block';
	document.getElementById('div-awards').style.display = 'none';
}

function toggleAwards(){
	document.getElementById('div-catalogs').style.display = 'none';
	document.getElementById('div-awards').style.display = 'block';
}

var segar = new Vue({
    el: '#content',
    data: {
        awards : awards,
        all_year : all_year,
        isAll : true,
    },
});