;(function() {
api = {
	tasks: [],

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
		api.getList(
			'task.item.list', 
			[
				{ID : 'desc'},
				{'!STATUS': '5'},
				{},
			],
			function (err, res){
				if (!err) {
					cb(null, res);
				} else {
					console.log("getTasks error");
				}
			}
		);
	},

	moveToFolder: function (params, cb) {
    	console.log('js/api.moveToFolder 0', params);

		api.getList(
			'entity.item.get',
			{
				ENTITY: 'tasks',
				FILTER: {
					PROPERTY_USER_ID: params.USER_ID,
				    PROPERTY_TASK_ID: params.TASK_ID
				}
			},
			function (err, res) {
				if (!err) {
					console.log("moveToFolder res", res);
					// Если есть запись, то нужно ее обновить, в противном случае добавить
					if (res && res.answer && res.answer.total) {
						BX24.callMethod('entity.item.update', {
						    ENTITY: 'tasks',
						    ID: res.answer.result[0].ID,
						    PROPERTY_VALUES: {
						        USER_ID: params.USER_ID,
						        TASK_ID: params.TASK_ID,
						        FOLDER: params.FOLDER,
						    }
						});
					} else {
						BX24.callMethod('entity.item.add', {
						    ENTITY: 'tasks',
						    NAME: params.USER_ID + '_' + params.TASK_ID + '_' + params.FOLDER,
						    PROPERTY_VALUES: {
						        USER_ID: params.USER_ID,
						        TASK_ID: params.TASK_ID,
						        FOLDER: params.FOLDER,
						    }
						});


					}
					cb(null, {TASK_ID: params.TASK_ID, FOLDER: params.FOLDER});
				} else {
					console.log("moveToFolder error");
				}
			}
		);
	},

	getTaskFolders: function (params, cb) {
		console.log('getTaskFolders', params);
		api.getList(
			'entity.item.get',
			{
				ENTITY: 'tasks',
				FILTER: {
					PROPERTY_USER_ID: params.USER_ID,
				}
			},
			function (err, res) {
				if (!err) {
					console.log("getTaskFolders ok", res);
					var _res = [];
					for ( var key in res ) {
						_res.push({
							TASK_ID: res[key].PROPERTY_VALUES.TASK_ID,
							FOLDER: res[key].PROPERTY_VALUES.FOLDER
						});
					}
					
					cb(null, _res);
				} else {
					console.log("getTaskFolders error");
				}
			}
		);
	},

	getList: function (entity, params, cb) {
		console.log('getList', entity, params);
		BX24.callMethod(
			entity, 
			params,
			function(result) {
				var res = [];
				if ( result.error() ) {
					// displayErrorMessage('К сожалению, произошла ошибка получения данных');
					cb(500, null)
					console.error('getList error', result.error());
				} else {
					var data = result.data();
					console.log('data', data);
					
					for ( var key in data ) {
						res.push(data[key]);
					}
								
					if ( result.more() ) {
						result.next();
					} else {
						console.log('getList Получены все данные', res);
						cb(null, res);

					}
						
				}
			}
		);		
	},


}

console.log('js/api.js loaded');
})();