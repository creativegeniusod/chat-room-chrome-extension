$(document).ready( async function() {
	
	// Show saved value.
	const currentDuration = await LauncherHideDuration.get();
	$('.duration label span').html(currentDuration);


	$('.duration button').on('click', function() {

		const inputValue = $('.duration input').val();
		const duration = parseInt(inputValue);
		
		if (Number.isInteger(duration)) {

			if (duration >= 1) {
				LauncherHideDuration.set(duration);
				alert('Duration Updated.');
				window.close();
			}
			else alert('Number Should be greater than 1');
		} else alert('Please input a Number.');
	});


	// Show saved value.
	const extMode = await ExtensionMode.get();
	$('.ext-mode input[type=radio]').filter(`[value=${extMode}]`).prop('checked', true);

	$('.ext-mode input[type=radio]').on('change', function() {
		ExtensionMode.set($(this).val());
	});
});