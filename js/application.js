// var pathName = "/bitrix/tools/akop.tasks/";

tasks = {
	userId: 0,
	tasks: [],
	extData: {
		tasks: []
	},
	folders: [
		{"type": "ALL", "name": "Все", "kind": "system"}, // 1
		{"type": "INBOX", "name": "Входящие", "kind": "system"}, // 1
		{"type": "TODAY", "name": "Сегодня", "kind": "till"}, // 2
		{"type": "TOMORROW", "name": "Завтра", "kind": "till"}, // 2
		{"type": "WEEK", "name": "Неделя", "kind": "till"}, // 2
		{"type": "FOCUS", "name": "Важно", "kind": "folder"}, // 3
		{"type": "NORMAL", "name": "Стандарт", "kind": "folder"}, // 3
		{"type": "MAYBE", "name": "Возможно", "kind": "folder"}, // 3
		{"type": "WAITINGFOR", "name": "Ждем", "kind": "folder"}, // 4
		{"type": "FAST", "name": "Быстрые дела", "kind": "folder"}, // 4
		{"type": "STUPID", "name": "Рутина", "kind": "folder"}, // 4
	],

// разделить на столбцы

	getTasks: function () {
		// var curapp = this;

		BX24.callMethod(
			'task.item.list', 
			[],
			function(result) {
				if ( result.error() ) {
					displayErrorMessage('К сожалению, произошла ошибка получения задач. Попробуйте повторить позже');
					console.error(result.error());
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
						console.log('Получены все данные');
						console.log('tasks', tasks.tasks);
						tasks.showTasks();

					}
						
				}
			}
		);	
	},

	getTask: function (obj) {
		return $(obj).closest(".task");
	},

	getId: function ($taskDiv) {
		return $($taskDiv).attr("data-id");
	},

	getNumber: function ($taskDiv) {
		return $($taskDiv).attr("data-number");
	},

	getNumberById: function (taskId) {
		return $('[data-id="' + taskId + '"]').attr("data-number");
	},

	approve: function () {
		this.action.call(this, "approve");
	},

	disapprove: function () {
		this.action.call(this, "disapprove");
	},

	defer: function () {
		this.action.call(this, "defer");
	},

	close: function () {
		this.action.call(this, "close");
	},

	// Перемещает задачи в другую папку
	moveToFolder: function () {
		// var curapp = this;
		// tasks.action.call(this, "moveToFolder");
		var taskId = tasks.getTaskId(this);
		params = {
			task_id: taskId,
			folder: tasks.folders[ this.dataset.folder ]["type"] 
		};

		console.log("moveToFolder", this, taskId, params, tasks.getNumberById(taskId));
		tasks.tasks[ tasks.getNumberById(taskId) ].FOLDER = params["folder"];
			tasks.extData.tasks.push( params );
			// tasks.extData.tasks[ "task_" + taskId ] = {"FOLDER" : params["folder"]};
		// if (typeof tasks.extData.tasks[ taskId ] == "undefined") {

		// }

		console.log("moveToFolder__tasks.extData", tasks.extData, JSON.stringify(tasks.extData));
	},

	getTaskId: function (obj) {
		return tasks.getId( tasks.getTask(obj) );
	},

	action: function (filename) {
		// var curapp = this;


		// var curapp = this;
		// akop.debug.log("moveToFolder", this, this.dataset.folder);
		var $taskDiv = tasks.getTask(this);
		var taskId = tasks.getId($taskDiv);
		// var taskNumber = tasks.getNumber($taskDiv);
		params = {task_id: taskId};
		switch (filename) {
	    case "moveToFolder":
			params["folder"] = tasks.folders[ this.dataset.folder ]["type"];
			console.log("action", filename, this, params);
			tasks.tasks[ tasks.getNumberById(taskId) ].FOLDER = params["folder"];

			console.log('folder', tasks.tasks[ tasks.getNumberById(taskId) ].FOLDER, tasks.getNumberById(taskId));

			break;
	    case "defer":
			params["days"] = this.dataset.days;
			break;
		}
			tasks.showTasks();
/*
		$.getJSON(pathName + filename + ".php", params)
			.done(function(response) {
				if (response["OK"]) {
					var taskNumber = tasks.getNumberById(response["ID"]);
					switch (filename) {
				    case "moveToFolder":
							tasks.list[taskNumber].FOLDER = response["FOLDER"];
				      break;
				    case "defer":
							tasks.list[taskNumber].DEADLINE = response["DEADLINE"];
							tasks.list[taskNumber].OVERDUED = false;
							tasks.list[taskNumber].FOLDER_TILL = response["FOLDER_TILL"];
				      break;
				    default:
							tasks.list.splice(taskNumber, 1);
				      break;
					}
					
		// akop.debug.log("action", this, filename);
					tasks.show();
				} else {
					akop.showMessage("Неизвестная ошибка", 5000, "danger");
					// tasks.show();
				}
			})
			.fail(function(){
				akop.showMessage("Ошибка соединения с сервером. Попробуйте позже.", 5000, "danger");
				// tasks.show();
			});
*/			
	},



	getName: function (lastname, name, login) {
		result = lastname + " " + name;
		if (result == " ") result = "(" + login + ")";
		return result;
	},

	// Показывает задачи
	showTasks: function () {
		var curapp = this;
		// tasks.getTasks();
		var folderName = $("#nav-tasks .active").attr("data-folder-name");

		var counters = [];
		// counters["ALL"] = 0;
		// counters["INBOX"] = 0;
		for (var key in tasks.folders) {
			counters[key] = 0;
		}


		var str = "";
		for (var i = 0; i < tasks.tasks.length; i++) {
			var d = tasks.tasks[i];

			if (1) {
			// if (filterByMember && filterByGroup && filterByResponsible && filterByTag) {
				counters["ALL"]++;
				counters[d.FOLDER]++;
				counters[d.FOLDER_TILL]++;
			}

			if (
				(d.FOLDER == folderName) || (folderName == "ALL") // filter by folder
				// ((d.FOLDER == folderName) || (d.FOLDER_TILL == folderName) || (folderName == "ALL")) // filter by folder
				// && filterByGroup // filter by group
				// && filterByMember // filter by whoami
				// && filterByResponsible 
				// && filterByTag
			) {

				str += '<div class="task well row priority' + d.PRIORITY 
					+ ((d.STATUS == 5) ? " closed" : "") 
					+ ((d.STATUS == 4) ? " almost-closed" : "") 
					+ '"'
					+ " data-number=\"" + i + "\""			
					+ ' data-id="' + d.ID + '"'
					// + ' data-i="' + d.ID + '"'
					+ '>';
					// + d.TITLE
					// + "</div>";

		/* Task title */
				str += "<div class=\"task-main col-md-5\">"
				 	+ "<span class=\"label label-success\">" + d.ID + "</span>"
					+ "<div class=\"task-title\">"
					+ "<a href=\"/company/personal/user/" + tasks.userId + "/tasks/task/view/" + d.ID + "/\">" + d.TITLE + "</a>"
					+ "</div>"
					+ "</div>";


				/* Actions */
				str += "<div class=\"task-tools col-md-3\">";

				if (!d.ACTION_APPROVE && !d.ACTION_DISAPPROVE && (d.RESPONSIBLE_ID == tasks.userId)) 
					str += "<a href=\"#\" class=\"\" data-function=\"tasks.close\"><span class=\"glyphicon glyphicon-flag\"></span>&nbsp;Завершить задачу</a><br/>";

				if (d.ACTION_APPROVE) 
					str += "<a href=\"#\" class=\"\" data-function=\"tasks.approve\"><span class=\"glyphicon glyphicon-thumbs-up\"></span>&nbsp;Принять работу</a><br/>";
		    
				if (d.ACTION_DISAPPROVE) 
					str += "<a href=\"#\" class=\"\" data-function=\"tasks.disapprove\"><span class=\"glyphicon glyphicon-thumbs-down\"></span>&nbsp;Доделать</a><br/>";

				if (d.ACTION_CHANGE_DEADLINE) {
			        str += 
			          	"<div><a id=\"dropdownMenuDefer\" href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">"
			          	+ "<span class=\"glyphicon glyphicon-time\"></span>&nbsp;Отложить <b class=\"caret\"></b></a>"
						+ "<ul class=\"dropdown-menu\" id=\"#defer\" role=\"menu\">"
						+ "<li><a href=\"#\" data-function=\"tasks.defer\" data-days=\"1\">На завтра</a></li>"
						+ "<li><a href=\"#\" data-function=\"tasks.defer\" data-days=\"7\">На неделю</a></li>"
						+ "</ul></div>";
					}

		        str += 
					"<div><a id=\"dropdownMenuFolder\" href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\"><span class=\"glyphicon glyphicon-folder-open\"></span>&nbsp;Переместить в папку <b class=\"caret\"></b></a>"
					+ "<ul class=\"dropdown-menu\" role=\"menu\">" ;

				for (var key in tasks.folders) {
					if (tasks.folders[key].kind == "folder") {
						str += "<li><a href=\"#\" data-function=\"tasks.moveToFolder\" data-folder=\"" + key + "\">" + tasks.folders[key]["name"] + "</a></li>";
					}
				}
				str += "</ul></div></div>";

				/* Deadline */
					if (d.DEADLINE) deadline = d.DEADLINE.split(' ');
				str += "<div class=\"task-deadline-col col-md-2\">"
					+ ((d.DEADLINE) 
						? "<div class=\"task-deadline" + ((d.OVERDUED) ? " task-status-overdue" : "") + "\">"
							+ "<span class=\"glyphicon glyphicon-time\"></span>&nbsp;" 
							+ "<span>" 
							+ "<span class=\"task-deadline-date webform-field-action-link\" "
							+ "onclick=\"tasks.onDeadlineChangeClick(" + d.ID + ", this, '" + d.DEADLINE + "');\">" + deadline[0]
							// + "onclick=\"tasksListNS.onDeadlineChangeClick(" + d.ID + ", this, '" + d.DEADLINE + "');\">" + deadline[0]
							+ "</span>&nbsp;"
							+ "<span class=\"task-deadline-time webform-field-action-link\" "
							+ "onclick=\"tasks.onDeadlineChangeClick(" + d.ID + ", this, '" + d.DEADLINE + "');\">" + deadline[1]
							// + "onclick=\"tasksListNS.onDeadlineChangeClick(" + d.ID + ", this, '" + d.DEADLINE + "');\">" + deadline[1]
							+ "</span>"
							+ "</span>"
							+ "</div>" 
						: "")
					+ ((d.CLOSED_DATE && (d.STATUS == 4)) ? "<div><span class=\"glyphicon glyphicon-flag\"></span>&nbsp;" + d.CLOSED_DATE + "</div>" : "")
					+ "</div>";

				/* Task team */
				str += "<div class=\"task-team col-md-2\">" + tasks.getName(d.CREATED_BY_LAST_NAME, d.CREATED_BY_NAME, d.CREATED_BY_LOGIN) + "<br/>"
					+ "<span class=\"glyphicon glyphicon-hand-down\"></span>&nbsp;" + "<br/>"
					+ tasks.getName(d.RESPONSIBLE_LAST_NAME, d.RESPONSIBLE_NAME, d.RESPONSIBLE_LOGIN) + "</div>";

				str += "</div>";
			}




			// if (groups.currentId == -1) {
			// 	str += ((d.GROUP_ID > 0) ? "<div class=\"task-group\">"
			// 		+ "<a href=\"/workgroups/group/" + d.GROUP_ID + "/\">" + groups.list[d.GROUP_ID] + "</a>"
			// 		+ "</div>" : "")
			// }


			// if ("ALL_TODAY_TOMORROW_WEEK".indexOf(folderName) > -1) {
			// 	str += "<span class=\"glyphicon glyphicon-folder-close\"></span>&nbsp;" + tasks.folders[d.FOLDER]["name"];
			// }

			str += "</div>";			
		};
		$(".tasks").html(str);
		tasks.setListener4TaskTool();
	},

	// Формирует и показывает меню из типов задач
	showTasksTypes: function () {
		var curapp = this;
		// var foldersAction = tasks.folders.concat( tasks.foldersActionTill.concat(tasks.foldersAction) );
		var str = "";
		for (var i = 0; i < tasks.folders.length; i++) {
			str += '<li id="tab_' + tasks.folders[i].type + '"'
				+ ' data-folder-name="' + tasks.folders[i].type + '"'
				+ ' data-folder-kind="' + tasks.folders[i].kind
				+ '">'
				+ ' <a href="#">'
				+ tasks.folders[i].name
				+ '&nbsp;<span class="label label-default"></span>'
				+ '</a></li>';
			
		};
		$("#nav-tasks").html(str);
		$("#nav-tasks li").on("click", tasks.setActive)
	},

	setListener4TaskTool: function () {
		// var curapp = this;
		$(".task-tools a")
			.off()
			.on("click", function(e) {
				console.log("onclick", e, this.dataset);
				// var curapp = this;
				// var curapp = application;
				e.preventDefault();
				if ((this.dataset) && (this.dataset.function)) {
					// var myFunction = eval('(moveToFolder:);
					var myFunction = eval('(' + this.dataset.function + ')');
					myFunction.call(this);
				}
			});
	},

	// Устанавливает активность меню (типа задач)
	setActive: function (e) {
		var curapp = this;
		console.log('setActive', e, e.target);
		$("#nav-tasks li").removeClass("active");
		$(e.target).closest("li").addClass("active");
		tasks.showTasks();

	}

}

$(document).ready(function () {
	console.log("1");
	// app = new application();

	BX24.init(function (e) {
		console.log("init", e);
		return true;
	});

	console.log("isInit", BX24, BX24.isInit);

	// Подмена функций для тестирования приложения
	if (typeof BX24.isInit == "undefined") {

		console.log("not Init");
		BX24.callMethod = BX25.callMethod;
		// BX24.callMethod = function(method, params, func) {
		// 	console.log(method, params, func);
		// 	return "";
		// }
	} else {
		console.log("false start");
	}

	tasks.showTasksTypes();
	tasks.getTasks();



//  	BX24.init = function () {
//  		console.log("подмена");
	// app.showTasks();
//  		return true;
//  	}

});

