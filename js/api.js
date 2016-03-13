;(function() {
api = {
	// tasks: false,

	getResponse: function (response) {
		return {
        	data: function () {
        		return response.result;
	    	},
	    	more: function() {
	    		return false;
	    	},
	    	error: function() {
	    		return false;
	    	}

		}
	},

	getTasks: function (cb) {
		BX24.callMethod(
			'task.item.list', 
			[],
			function(result) {
				if ( result.error() ) {
					displayErrorMessage('К сожалению, произошла ошибка получения задач. Попробуйте повторить позже');
					console.error('getTasks error', result.error());
				} else {
					var data = result.data();
					console.log('data', data);
					
					for ( var task in data ) {
						console.log(task.ID);
						tasks.tasks.push(data[task]);
					}
								
					if ( result.more() ) {
						result.next();
					} else {
						console.log('getTasks. Получены все данные');
						console.log('tasks', tasks.tasks);
						cb();

					}
						
				}
			}
		);
	},

	getTasksFolders: function (params, func) {
	},
}

})();