var install = {

	prepareEntity: function (arEntityDesc) {
		var batch = [];
		
		batch.push(['entity.add', {'ENTITY': arEntityDesc.NAME, 'NAME': arEntityDesc.DESC, 'ACCESS': {AU: 'W'}}]);
		batch.push(['entity.update', {'ENTITY': arEntityDesc.NAME, 'ACCESS': {AU: 'W'}}]);
		
		for (indexProperty in arEntityDesc.PROPERTIES) 
			batch.push(['entity.item.property.add', {
				ENTITY: arEntityDesc.NAME, 
				PROPERTY: arEntityDesc.PROPERTIES[indexProperty].CODE, 
				NAME: arEntityDesc.PROPERTIES[indexProperty].NAME, 
				TYPE: arEntityDesc.PROPERTIES[indexProperty].TYPE
			}]);

		return batch;		
	},


	start: function () {
		
		// define storages
		var tasksEntity = {
			NAME: 'tasks',
			DESC: 'Tasks data',
			PROPERTIES: [
				{CODE: 'USER_ID', NAME: 'User ID', TYPE: 'N'},
				{CODE: 'TASK_ID', NAME: 'Task ID', TYPE: 'N'},
				{CODE: 'FOLDER', NAME: 'Folder Type', TYPE: 'S'}
			]
		};
		
		var arEntityBatch = this.prepareEntity(tasksEntity);

		BX24.callBatch(arEntityBatch, 
		
			function (result) {
				if (result.error()) {
					app.displayErrorMessage('К сожалению, произошла ошибка установки прилоджения. Попробуйте переустановить приложение позже');
					console.error(result.error());
				} else {
					BX24.installFinish();
				}
			}
		});	
		
	}
}


$(document).ready(function () {
	BX24.init(function (e) {
		console.log("init", e);
		return true;
	});

	console.log("isInit", BX24, BX24.isInit);

	// Подмена функций для тестирования приложения
	if (typeof BX24.isInit != "undefined") {
		console.log("install");
		install.start();
	} else {
		console.log("false start");
	}

});

