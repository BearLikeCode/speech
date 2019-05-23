$(document).ready(function() {
	$('#btnFromFile').on('click', fromFile)
	$('#btnFromYoutube').on('click', fromYoutube)
});

function fromFile(event) {
	event.preventDefault();

	const form = document.querySelector('#formFile');

	const data = new FormData(form);

	$.ajax({
		type: 'POST',
		data: data,
		url: '/main/file',
		async: true,
		cache: false,
		processData: false,
		contentType: false,
		success: function(data){
			$('#text').text(data.text);
			console.log(data);
		}
	})
}

function fromYoutube(event) {
	event.preventDefault();

	const form = document.querySelector('#formYoutube');

	const data = new FormData(form);

	$.ajax({
		type: 'POST',
		data: data,
		url: '/main/youtube',
		async: true,
		cache: false,
		processData: false,
		contentType: false,
		success: function(data){
			$('#text').text(data.text);
			console.log(data);
		}
	})
}
