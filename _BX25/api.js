var BX25 = {
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

	getTasks: function (params, func) {
	    $.post("/_ajax/tasks.json")
	        .done(function(response) {
	        	// console.log('response', response);
	        	// data = JSON.parse(response);
	        	// tasks.tasks = response.result;
	        	console.log('BX25.getTasks');
	        	// tasks.showTasks();
	        	func(BX25.getResponse(response));	      	
        	})
	        .fail(function() {
	          	console.log("getTasks fail");
	        });

	},

	getTasksFolders: function (params, func) {
	    $.post("/_ajax/tasksFolders.json")
	        .done(function(response) {
	        	tasks.tasks = response.result;
	        	func.apply(this);
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
		  case 'entity.item.get':  
			console.log("switch task.item.get");
		    BX25.getTasksFolders(params, func);
		    break;
		  default:
		    break;
		}
		return "";
	}
	
}