;(function() {
var path = '/api/v1/';
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
	    $.get(path + "tasks")
	        .done(function(res) {
	        	console.log('_stub/api.getTasks 1');
	        	cb(null, JSON.parse(res).result);
	        	console.log('_stub/api.getTasks 2');
        	})
	        .fail(function(err) {
	          	console.log("getTasks fail", err);
	        	cb(err.status, null);
	        });

	},


	moveToFolder: function (params, cb) {
    	console.log('_stub/api.moveToFolder 0', params);
	    $.post(path + "taskFolders", params)
	        .done(function(response) {
	        	cb(null, response);
        	})
	        .fail(function(err) {
	        	console.log('moveToFolder fail', err);
	        	cb(err.status, null);
	        });
	},


	getTaskFolders: function (params, cb) {
	    $.get(path + "taskFolders/" + params.USER_ID)
	        .done(function(res) {
	        	cb(null, res);
	      	})
	        .fail(function(err) {
	          	console.log("getTasks fail");
	        	cb(err.status, null);
	        });

	},

	callMethod: function (method, params, func) {
		console.log("api.callMethod", method, params, func);

		switch(method) {
		  case 'task.item.list':  
			console.log("switch task.item.list");
		    api.getTasks(params, func);
		    break;
		  case 'entity.item.get':  
			console.log("switch task.item.get");
		    api.getTasksFolders(params, func);
		    break;
		  default:
		    break;
		}
		return "";
	}
	
}
console.log('_stub/api.js loaded');
BX24.callMethod = api.callMethod;
})();