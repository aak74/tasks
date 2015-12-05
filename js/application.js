function application () {
	this.currentUser = 0;
	this.arInstallRatingUsers = {};
}

application.prototype.getUserTasks = function () {
	var curapp = this;

	BX24.callMethod(
		'task.item.list', 
		[],
		function(result) 
		{
			if (result.error()) {
				displayErrorMessage('К сожалению, произошла ошибка получения задач. Попробуйте повторить позже');
				console.error(result.error());
			} else {
				var data = result.data();
				
				for (task in data) {
					console.log(task);
				}
							
				if (result.more())
					result.next();
				else {
					console.log('Получены все данные');
				}
					
			}
		}
	);	
}


application.prototype.showTasks = function () {
	var curapp = this;
	curapp.getUserTasks();
}

app = new application();
