var akop = {
  debug: {
      isOn: true,
      log: function() {
          if (this.isOn && window.console)
              console.log.apply(window.console, arguments);
      },
      warn: function() {
          if (this.isOn && window.console)
              console.warn.apply(window.console, arguments);
      },
      dir: function() {
          if (this.isOn && window.console)
              console.dir.apply(window.console, arguments);
      },
      stop: function() {
          if (this.isOn)
              debugger;
      }
  },
	
	getTargetObject: function (e) {
		return (e.target.tagName == "A") ? e.target	: e.target.parentNode;
	},

	getOffsetRectById: function (elemId) {
		return akop.getOffsetRect(document.getElementById(elemId));
	},


	/** Находим координаты нужного блока */
	getOffsetRect: function (elem) {
		if (elem == null) {
			result = {top: 0, left: 0};
		} else {
			var box = elem.getBoundingClientRect();
			
			var body = document.body;
			var docElem = document.documentElement;
			
			var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
			
			var clientTop = docElem.clientTop || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;
			
			var top  = box.top +  scrollTop - clientTop;
			var left = box.left + scrollLeft - clientLeft;
		
			result = {top: Math.round(top), left: Math.round(left)};
		}
		return result;
	},


	/** 
	 *  Загружает страницу указанную в атрибуте href, показывает ее в модальном окне
	 *  работа в 6 этапов:
	 *  1. Загружает страницу страницу указанную в атрибуте href
	 *  2. Запускаем функцию указанную в аттрибуте data-callback-function-before-load 
	 *     (в этой функции должен быть код выполняющий допобработки перед загрузкой, например, формирование url)
	 *  3. Помещает в модальное окно
	 *  4. На кнопку сохранения вешаем функцию указанную в аттрибуте data-callback-function
	 *  5. Открываем модальное окно
	 *  6. Запускаем функцию указанную в аттрибуте data-callback-function-after-load (в этой функции должен быть код выполняющий допобработки перед редактированием)
	 *  
	 */
	showAjaxPage: function (e) {
		e = e || window.event;
		akop.debug.log("showAjaxPage e", e);
		e.preventDefault();
		akop.closeDismissable();

		
		/** Получаем данные в тэге "A" */

		var obj = akop.getTargetObject(e);
		var d = obj.dataset;

		var url = obj.href;
		var callbackFunctionAfterLoad = eval('(' + d.callbackFunctionAfterLoad + ')');
		var callbackFunctionBeforeLoad = eval('(' + d.callbackFunctionBeforeLoad + ')');


		if (callbackFunctionBeforeLoad != undefined) callbackFunctionBeforeLoad.call(this, obj, e);
		$.ajax({
			type: "POST",
			"url": url,
			data: d,
			error: function() {
				akop.showMessage("Ошибка загрузки данных. Попробуйте позже.", 5000, "danger");
			},
			success: function(response) {
				akop.showModal(e, response, d.callbackFunction);

				if (callbackFunctionAfterLoad != undefined) callbackFunctionAfterLoad.call(this, obj, e);
			},
			complete: function() {
			}
		});
		
	},

	showModal: function (e, message, callbackFunction) {
		e = e || window.event;
		e.preventDefault();
		akop.closeDismissable();

		
		/** Получаем данные в тэге "A" */

		var obj = akop.getTargetObject(e);
		var d = obj.dataset;

		/** Размер модального окна */
		$modalDialog = $('.modal-dialog')
			.removeClass("modal-sm")
			.removeClass("modal-lg");

		if (d.modalSize) {
			$modalDialog.addClass(d.modalSize);
		}

		$(".modal-header").css("display", "block");
		$("#myModalLabel").text(d.heading);
		$("#modal-body").html(message);
		$('#myModal').modal({ keyboard: true }).modal('show');
		$('#myModal').find("input").first().focus();
		var callbackFunction = eval('(' + callbackFunction + ')');

		$("#modal-submit").off("click").on("click", function(e){
			$('#myModal').modal('hide');
			callbackFunction.call(this, obj);
			return false;
		});


	},

	/**
	*	Скрываем всплывающее сообщение
	*/
	closeMessage: function () {
		$("#akop-alerter").remove();
	},

	/**
	*	Показываем всплывающее сообщение
	*/

	showMessage: function (message, messageTimeout, messageType) {
		akop.closeDismissable();
		if (typeof messageType == 'undefined') messageType = "info";
		var alerterId = "akop-alerter";
		$("#" + alerterId).remove();
		var divAlert = "<div id=\"" + alerterId + "\" class=\"alert alert-" + messageType + "\">" + message + "</div>";

		$("body")
			.append(divAlert)
			.fadeIn(300);
			
		/* Скрываем всплывающее сообщение после таймаута*/
		if (messageTimeout != undefined) {
			setTimeout(
				function () {$("#" + alerterId).fadeOut(300).remove();},
				messageTimeout
			);
		}
	},

	/**
	*	Показываем всплывающее сообщение
	*/
	showDismissable: function (message, messageType) {
		akop.closeDismissable();
		if (typeof messageType == 'undefined') messageType = "info";

		$container = $("#dismissable")
			.append("<div class=\"alert alert-dismissable alert-" + messageType + "\">"
				+ "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\">&times;</button>"
				+ message
				+ "</div>")
			.fadeIn(300)
			.find("a")
			.on("click", function(e) {
				e = e || window.event;
				e.preventDefault();

				var obj = akop.getTargetObject(e);
				var callbackFunction = eval('(' + obj.dataset.callbackFunction + ')');
				if (callbackFunction != undefined) callbackFunction.call(this, obj, e);
			});

	},

	closeDismissable: function () {
		$("#dismissable").empty();
	},

	/** Показать запрос на подтверждение действия */
	showConfirm: function (textMessage, callback_yes) {
		akop.closeDismissable();

		$("#modal-body").text(textMessage);
		$(".modal-header").css("display", "none");
		$('#myModal').modal('show');

		$("#modal-submit").on("click", function(e){
			$('#myModal').modal('hide');
			akop.debug.log("modal-submit", e);
			callback_yes.call();
		});

	},

	nl2br: function(varTest){
		return varTest.replace(/(\r\n|\n\r|\r|\n)/g, "<br>");
	},

	br2nl: function(varTest){
		return varTest.replace(/<br( \/)?>/g, "\r");
	}
};


$(document).ready(function() {
	/** Обработка ссылок, которые должны открываться во всплывающем окне  */
	$(".ajax-page")
		.on("click", akop.showAjaxPage);
});