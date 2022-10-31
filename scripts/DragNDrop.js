var dragElement = (ele) => {

	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (document.getElementById("chat-room-frame-mover")) {
		 document.getElementById("chat-room-frame-mover").onmousedown = dragMouseDown;
	} else {
		ele.onmousedown = dragMouseDown;
	}

	var ele1 = document.getElementById('chat-room-frame-container');

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();

		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;

		document.onmouseup = closeDragElement;

		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;

	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();

		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;

		ele.style.left = (ele.offsetLeft - pos1) + "px";
		ele.style.top = (ele.offsetTop - pos2) + "px";
	}


	function closeDragElement() {
		
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}