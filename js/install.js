;(function() {
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
		console.log("start 1");
		
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

		BX24.callBatch(
			arEntityBatch, 
			function (result) {
				console.log(result);
				if (result.error) {
					app.displayErrorMessage('К сожалению, произошла ошибка установки приложения. Попробуйте переустановить приложение позже');
					console.error(result.error);
				} else {
					BX24.installFinish();
				}
			}
		);
		console.log("start 2");
		
	}
}

BX24.init(function (e) {
	console.log("init", e);
	isInit = true;
	console.log("install");
	install.start();
});

})();