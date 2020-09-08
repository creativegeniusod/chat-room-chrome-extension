var Helper;

Helper = {

	/**
	* Find diff in two arrays
	*/
	arrayDiff: (a, b) => {
		
		if (a !== undefined) {
			const diff = Array();
			const joined = a.concat(b);
			for( i = 0; i <= joined.length; i++ ) {
				var current = joined[i];
				if( joined.indexOf(current) == joined.lastIndexOf(current) ) {
					if (current !== undefined) {
						diff.push(current);
					}
				}
			}
			return diff;
		}
		return b;
	},


	/**
	* Find diff in second array
	*/
	checkNewElementsInSecondArray: (a, b) => {
		if (a !== undefined) {
			const diff = Array();
			for (var i = 0; i < b.length; i++) {
				if (a.indexOf(b[i]) == -1) {
					diff.push(b[i]);
				}
			}
			return diff;
		}
		return b;
	},
};