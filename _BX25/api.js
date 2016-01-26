var BX25 = {
	// tasks: false,

	getTasks: function (method, params, func) {
	    $.post("/_ajax/tasks.json")
	        .done(function(response) {
	        	// console.log('response', response);
	        	// data = JSON.parse(response);
	        	tasks.tasks = response.result;
	        	// console.log('tasks.tasks', tasks.tasks);
	        	tasks.showTasks();
	      	})
	        .fail(function() {
	          console.log("getTasks fail");
	        });

	},

	callMethod: function (method, params, func) {
		console.log("BX25.callMethod", method, params, func);

		switch(method) {
		  case 'task.item.list':  
			console.log("switch task.item.list");
		    BX25.getTasks(params, func);
		    break;
		  default:
		    break;
		}
		return "";
	}
	
}