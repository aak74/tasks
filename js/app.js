;(function() {
// var pathName = "/bitrix/tools/akop.tasks/";

tasks = {
	userId: 1,
	tasks: [],
	taskFolders: [],
	extData: {
		tasks: []
	},
	folderNames: [],
	folders: [
		{"type": "INBOX", "name": "Входящие", "kind": "system"}, // 1
		{"type": "ALL", "name": "Все", "kind": "system"}, // 1
		{"type": "TODAY", "name": "Сегодня", "kind": "till"}, // 2
		{"type": "TOMORROW", "name": "Завтра", "kind": "till"}, // 2
		{"type": "WEEK", "name": "Неделя", "kind": "till"}, // 2
		{"type": "FOCUS", "name": "Важно", "kind": "importance"}, // 3
		{"type": "NORMAL", "name": "Стандарт", "kind": "importance"}, // 3
		{"type": "MAYBE", "name": "Возможно", "kind": "importance"}, // 3
		{"type": "WAITINGFOR", "name": "Ждем", "kind": "folder"}, // 4
		{"type": "FAST", "name": "Быстрые дела", "kind": "folder"}, // 4
		{"type": "STUPID", "name": "Рутина", "kind": "folder"}, // 4
	],

// разделить на столбцы

	getTasks: function () {
		api.getTasks(function(err, res) {
			console.log('getTasks cb', err, res);
			if (!err) {
				// tasks.tasks = res;
				for (var i in res) {
					console.log(res[i]);
					res[i].FOLDER_TILL = "";
					if (res[i].DEADLINE !== "" ) {
						deadline = moment(res[i].DEADLINE);
						today = moment().endOf('day');
						tommorow = moment().endOf('day').add(1, 'days');
						week = moment().endOf('day').add(7, 'days');
						// console.log(today, tommorow, week);
						if ( moment(deadline).isSameOrBefore(today) ) {
							res[i].FOLDER_TILL = "TODAY";
							res[i].OVERDUED = true;
						} else if ( moment(deadline).isSameOrBefore(tommorow) ) {
							res[i].FOLDER_TILL = "TOMORROW";
						} else if ( moment(deadline).isSameOrBefore(week) ) {
							res[i].FOLDER_TILL = "WEEK";
						} else {
							// res[i].FOLDER_TILL = "NOT_SOON";
						};
						
						// res[i].DEADLINE_DATE = deadline.format('DD.MM.YYYY');
						// res[i].DEADLINE_TIME = deadline.format('H:mm');
						res[i].DEADLINE = deadline.format("DD.MM.YYYY H:mm");
					}
					if (res[i].CLOSED_DATE) {
						res[i].CLOSED_DATE = moment(res[i].CLOSED_DATE).format("DD.MM.YYYY H:mm")
					}
					tasks.tasks.push(res[i]);
					// tasks.tasks[res[i].ID] = res[i];
				};
				// console.log(tasks.tasks);
				// tasks.tasks.each(function (i, d) {
				// });
				// err = res = null;
				tasks.getTaskFolders(tasks.showTasks);
			}
		});
	},

	getTaskFolders: function (cb) {
		api.getTaskFolders({'USER_ID': tasks.userId}, function(err, res) {
			if (!err) {
	        	console.log('app__getTaskFolders__', err, res);
				tasks.taskFolders = [];
				for (var key in res) {
					tasks.updateFolder(res[key]['TASK_ID'], res[key].FOLDER);
				}
	        	console.log('getTaskFolders', tasks.taskFolders);
	        	cb();

			}
		});
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

	updateFolder: function (taskId, folder) {
		tasks.taskFolders[ 't' + taskId ] = folder;
	},

	// Перемещает задачи в другую папку
	moveToFolder: function () {
		// tasks.action.call(this, "moveToFolder");
		var taskId = tasks.getTaskId(this);
		params = {
			USER_ID: tasks.userId,
			TASK_ID: taskId,
			FOLDER: tasks.folders[ this.dataset.folder ]["type"] 
		};

		console.log("moveToFolder", this, taskId, params, tasks.getNumberById(taskId));
		api.moveToFolder(
			params, 
			function(err, res) {
				// console.log('moveToFolder taskId', taskId);
				if (!err) {
					tasks.updateFolder(res.TASK_ID, res.FOLDER)
					tasks.showTasks();
				}
			}
		);
	},

	getTaskId: function (obj) {
		return tasks.getId( tasks.getTask(obj) );
	},

	action: function (filename) {
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
		// tasks.getTasks();
		var folderName = $("#nav-tasks .active").attr("data-folder-name");
		console.log('showTasks folderName', folderName);

		/* Обнуляем все счетчики */
		var counters = [];
		counters["ALL"] = 0;
		for (var key in tasks.folders) {
			counters[tasks.folders[key].type] = 0;
		}


		var str = "";
		for (var i = 0; i < tasks.tasks.length; i++) {
			var d = tasks.tasks[i];
			d.FOLDER = ( ( tasks.taskFolders['t' + d.ID] ) 
				? tasks.taskFolders['t' + d.ID]
				: "INBOX"
			);

			counters["ALL"]++;
			counters[d.FOLDER]++;
			counters[d.FOLDER_TILL]++;

			// console.log('showTasks', folderName, d.FOLDER)

			if (
				// (d.FOLDER === folderName) || (folderName === "ALL") // filter by folder
				((d.FOLDER == folderName) || (d.FOLDER_TILL == folderName) || (folderName == "ALL")) // filter by folder
				|| (d.FOLDER === undefined) && (folderName === "INBOX") // filter by folder
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
				str += "<div class=\"task-main col-md-5 col-sm-4\">"
				 	+ "<span class=\"label label-success\">" + d.ID + "</span>"
					+ "<div class=\"task-title\">"
					+ "<a href=\"/company/personal/user/" + tasks.userId + "/tasks/task/view/" + d.ID + "/\">" + d.TITLE + "</a>"
					+ "</div>"
					+ ( (folderName == "ALL")
						? "<div class=\"task-title-folder\">"
							+ tasks.folderNames[d.FOLDER]
							+ ( (d.FOLDER_TILL !== "") 
								?  " / " + tasks.folderNames[d.FOLDER_TILL] 
								: ""
							)
							+ "</div>"
						: ""
					)
					+ "</div>";


				/* Actions */
				str += "<div class=\"task-tools col-md-3 col-sm-3\">";

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
					if ( (tasks.folders[key].kind === "folder") || (tasks.folders[key].kind === "importance")  ) {
						str += "<li><a href=\"#\" data-function=\"tasks.moveToFolder\" data-folder=\"" + key + "\">" + tasks.folders[key]["name"] + "</a></li>";
					}
				}
				str += "</ul></div></div>";

				/* Deadline */
				// if (d.DEADLINE !== '') deadline = d.DEADLINE.split('T');
				str += "<div class=\"task-deadline-col col-md-2 col-sm-3\">"
					+ ( (d.DEADLINE) 
						? "<div class=\"task-deadline" + ((d.OVERDUED) ? " task-status-overdue" : "") + "\">"
							+ "<span class=\"glyphicon glyphicon-time\"></span>&nbsp;" 
							+ "<span class=\"task-deadline-date\" "
							+ "onclick=\"tasks.deadlineChangeClick(" + d.ID + ", this, '" + d.DEADLINE + "');\">" + d.DEADLINE
							+ "</span>"
							+ "</div>" 
						: "")
					+ ((d.CLOSED_DATE && (d.STATUS == 4)) 
						? "<div><span class=\"glyphicon glyphicon-flag\"></span>&nbsp;"  + d.CLOSED_DATE + "</div>" 
						: ""
					)
					+ "</div>";

				/* Task team */
				str += "<div class=\"task-team col-md-2 col-sm-2\">" + tasks.getName(d.CREATED_BY_LAST_NAME, d.CREATED_BY_NAME, d.CREATED_BY_LOGIN) + "<br/>"
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
		console.log('counters', counters);
		for (var key in counters) {
			if ( counters[key] > 0) {
				$('#tab_' + key + ' span').text(counters[key]);
			}
		};
		tasks.setListener4TaskTool();
	},

	// Формирует и показывает меню из типов задач
	showTasksTypes: function () {
		// var foldersAction = tasks.folders.concat( tasks.foldersActionTill.concat(tasks.foldersAction) );
		var str = "", currentKind;
		for (var i = 0; i < tasks.folders.length; i++) {
			if ( currentKind !== tasks.folders[i].kind ) {
				currentKind = tasks.folders[i].kind;
				if ( i !== 0) {
					str += "</ul>";
				}
				str += '<ul class="folder-kind folder-kind-' + currentKind + ' nav nav-pills nav-stacked col-md-3 col-sm-3 col-xs-6">';
			}
			str += '<li id="tab_' + tasks.folders[i].type + '"'
				+ ( ( tasks.folders[i].type == "INBOX" ) ? ' class="active"' : '' )
				+ ' data-folder-name="' + tasks.folders[i].type + '"'
				+ ' data-folder-kind="' + tasks.folders[i].kind
				+ '">'
				+ ' <a href="#">'
				+ tasks.folders[i].name
				+ '&nbsp;<span class="label label-default"></span>'
				+ '</a></li>';

			if ( i == tasks.folders.length) {
				str += "</ul>";
			}
			
		};
		$("#nav-tasks").html(str);
		$("#nav-tasks li").on("click", tasks.setActive)
	},

	setListener4TaskTool: function () {
		$(".task-tools a")
			.off()
			.on("click", function(e) {
				console.log("onclick", e, this.dataset);
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
		console.log('setActive', e, e.target);
		$("#nav-tasks li").removeClass("active");
		$(e.target).closest("li").addClass("active");
		tasks.showTasks();

	},

	start: function () {
		console.log("start");
		tasks.showTasksTypes();
		for (var key in tasks.folders) {
			// console.log('tasks.folders[key]', key, tasks.folders[key]);
			tasks.folderNames[tasks.folders[key].type] = tasks.folders[key].name;
		}

		addScript(
			( isInit
				? window.location.pathname.replace("index.html", "") + 'js/api.js'
				: '/_stub/api.js'
			),
			function () {
				tasks.getTasks();
				tasks.saveFrameWidth();
			}
		);
	},

	resizeFrame: function () {

		var currentSize = BX24.getScrollSize();
		minHeight = currentSize.scrollHeight;
		
		if (minHeight < 800) minHeight = 800;
		BX24.resizeWindow(this.FrameWidth, minHeight);
	},

	saveFrameWidth: function () {
		this.FrameWidth = document.getElementById("app").offsetWidth;
	}
		
}

console.log("1");
// app = new application();

var isInit = false;
BX24.init(function (e) {
	console.log("init", e);
	isInit = true;
	console.log("tasks start");
});

setTimeout(tasks.start,	3000);

// console.log("isInit", BX24, BX24.isInit);

// Подмена функций для тестирования приложения
	        	// tasks.showTasks();

function addScript(src, callback) {
	var script = document.createElement('script');
    script.src = src;
	var s = document.getElementsByTagName('script')[0]
	s.parentNode.insertBefore(script, s);

	var loaded = false;

	function onload() {
		if (loaded) return; // повторный вызов
		loaded = true;
		callback();
	}

	script.onload = onload; // все браузеры, IE с версии 9

	script.onreadystatechange = function() { // IE8-
		if (this.readyState == 'loaded' || this.readyState == 'complete') {
			setTimeout(onload, 0);
		}
	};

}


})();