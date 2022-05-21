(function($) {
	var lang = {
		en: {
			days: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			months: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
			sep: '-',
			format: 'YYYY-MM-DD hh:mm',
			prevMonth: 'Previous month',
			nextMonth: 'Next month',
			today: 'Today'
		},
		ko: {
			days: ['일', '월', '화', '수', '목', '금', '토'],
			months: [ "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월" ]
		},
		
	};

	/* PickerHandler 객체 선언 */
	var PickerHandler = function($picker, $input){
		this.$pickerObject = $picker;
		this.$inputObject = $input;
	};
	
	/* picker 가져오기 */
	PickerHandler.prototype.getPicker = function(){
		return this.$pickerObject;
	};

	/* input-field  */
	PickerHandler.prototype.getInput = function(){
		return this.$inputObject;
	};

	/* 화면에 Picker 보여주기 */
	PickerHandler.prototype.isShow = function(){
		var is_show = true;
		if (this.$pickerObject.css('display') == 'none') {
			is_show = false;
		}
		return is_show;
	};

	/* DateTimePicker 보여줌 */
	PickerHandler.prototype.show = function(){
		var $picker = this.$pickerObject;
		var $input = this.$inputObject;

		$picker.show();

		ActivePickerId = $input.data('pickerId');

		if ($input != null && $picker.data('isInline') === false) { 
			// 	DateTimePicker를 입력 필드의 위치로 재배치
			this._relocate();
		}
	};

	/* 날짜 선택하기 */
	PickerHandler.prototype.getDate = function(){
		var $picker = this.$pickerObject;
		var $input = this.$inputObject;
		return getPickedDate($picker);
	};

	/* 특정 날짜 선택 */
	PickerHandler.prototype.setDate = function(date){
		var $picker = this.$pickerObject;
		var $input = this.$inputObject;
		if (!isObj('Date', date)) {
			date = new Date(date);
		}

		draw_date($picker, {
			"isAnim": true,
			"isOutputToInputObject": true
		}, date);
	};

	/* ----- */
	var PickerObjects = [];
	var InputObjects = [];
	var ActivePickerId = -1;

	var getParentPickerObject = function(obj) {
		return $(obj).closest('.datepicker');
	};

	var getPickersInputObject = function($obj) {
		var $picker = getParentPickerObject($obj);
		if ($picker.data("inputObjectId") != null) {
			return $(InputObjects[$picker.data("inputObjectId")]);
		}
		return null;
	};

	/* 현재 날짜와 시각 */
	var setToNow = function($obj) {
		var $picker = getParentPickerObject($obj);
		var date = new Date();
		draw($picker, {
			"isAnim": true,
			"isOutputToInputObject": true
		}, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
	};

	/* 전 달로 이동 */
	var beforeMonth = function($obj) {
		var $picker = getParentPickerObject($obj);

		if ($picker.data('stateAllowBeforeMonth') === false) { // Not allowed
			return;
		}

		var date = getPickedDate($picker);
		var targetMonth_lastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
		if (targetMonth_lastDay < date.getDate()) {
			date.setDate(targetMonth_lastDay);
		}
		draw($picker, {
			"isAnim": true,
			"isOutputToInputObject": true
		}, date.getFullYear(), date.getMonth() - 1, date.getDate(), date.getHours(), date.getMinutes());

		var todayDate = new Date();
		var isCurrentYear = todayDate.getFullYear() == date.getFullYear();
		var isCurrentMonth = isCurrentYear && todayDate.getMonth() == date.getMonth();
		
		if (!isCurrentMonth || !$picker.data("futureOnly")) {
			if (targetMonth_lastDay < date.getDate()) {
				date.setDate(targetMonth_lastDay);
			}
			draw($picker, {
				"isAnim": true,
				"isOutputToInputObject": true
			}, date.getFullYear(), date.getMonth() - 1, date.getDate(), date.getHours(), date.getMinutes());
		}
	};

	/* 다음 달로 이동 */
	var nextMonth = function($obj) {
		var $picker = getParentPickerObject($obj);
		var date = getPickedDate($picker);
		var targetMonth_lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		if (targetMonth_lastDay < date.getDate()) {
			date.setDate(targetMonth_lastDay);
		}

		/* 다음 달의 마지막 날짜 확인 */
		if (getLastDate(date.getFullYear(), date.getMonth() + 1) < date.getDate()) {
			date.setDate(getLastDate(date.getFullYear(), date.getMonth() + 1));
		}

		draw($picker, {
			"isAnim": true,
			"isOutputToInputObject": true
		}, date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
	};

	/* 특정 년도와 달의 마지막 날짜 확인 */
	var getLastDate = function(year, month) {
		var date = new Date(year, month + 1, 0);
		return date.getDate();
	};

	var getDateFormat = function(format, locale, is_date_only) {
		if (format == "default"){
			format = translate(locale,'format');
			if (is_date_only) {
				// YYYY/MM/DD 형식으로 변환
				format = format.substring(0, format.search(' '));
			}
		}
		return format; // 날짜 return
	};
	
	var normalizeYear = function (year) {
		if (year < 99) { 
			var date = new Date();
			return parseInt(year) + parseInt(date.getFullYear().toString().substr(0, 2) + "00");
		}
		return year;
	};
	
	// 날짜 파싱
	var parseDate = function (str, opt_date_format) {
		var re, m, date;
		if(opt_date_format != null){
			var df = opt_date_format.replace(/(-|\/)/g, '[-\/]')
				.replace(/YYYY/gi, '(\\d{2,4})')
				.replace(/(YY|MM|DD|hh|mm)/g, '(\\d{1,2})')
				.replace(/(M|D|h|m)/g, '(\\d{1,2})');
			re = new RegExp(df);
			m = re.exec(str);
			if( m != null){

				// 날짜 포맷 배열 생성
				var formats = [];
				var format_buf = '';
				var format_before_c = '';
				var df_ = opt_date_format;
				while (df_ != null && 0 < df_.length) {
					var format_c = df_.substring(0, 1); df_ = df_.substring(1, df_.length);
					if (format_before_c != format_c) {
						if(/(YYYY|YY|MM|DD|mm|dd|M|D|h|m)/.test(format_buf)){
							formats.push( format_buf );
							format_buf = '';
						} else {
							format_buf = '';
						}
					}
					format_buf += format_c;
					format_before_c = format_c;
				}
				if (format_buf !== '' && /(YYYY|YY|MM|DD|mm|dd|M|D|h|m)/.test(format_buf)){
					formats.push( format_buf );
				}

				// 년도, 달 , 일 , 시 , 분 객체 변환
				var year, month, day, hour, min;
				var is_successful = false;
				for(var i = 0; i < formats.length; i++){
					if(m.length < i){
						break;
					}
					var f = formats[i];
					var d = m[i+1]; 
					if(f == 'YYYY'){
						year = normalizeYear(d);
						is_successful = true;
					} else if(f == 'YY'){
						year = parseInt(d) + 2000;
						is_successful = true;
					} else if(f == 'MM' || f == 'M'){
						month = parseInt(d) - 1;
						is_successful = true;
					} else if(f == 'DD' || f == 'D'){
						day = d;
						is_successful = true;
					} else if(f == 'hh' || f == 'h'){
						hour = d;
						is_successful = true;
					} else if(f == 'mm' || f == 'm'){
						min = d;
						is_successful = true;
					} 
				}

				date = new Date(year, month, day, hour, min);
				if(is_successful === true && isNaN(date) === false && isNaN(date.getDate()) === false){ // Parse successful
					return date;
				}
			}
		}
		
		// 날짜 , 시간 파싱
		re = /^(\d{2,4})[-\/](\d{1,2})[-\/](\d{1,2}) (\d{1,2}):(\d{1,2})$/;
		m = re.exec(str);
		if (m !== null) {
			m[1] = normalizeYear(m[1]);
			date = new Date(m[1], m[2] - 1, m[3], m[4], m[5]);
		} else {
			// 날짜 파싱
			re = /^(\d{2,4})[-\/](\d{1,2})[-\/](\d{1,2})$/;
			m = re.exec(str);
			if(m !== null) {
				m[1] = normalizeYear(m[1]);
				date = new Date(m[1], m[2] - 1, m[3]);
			}
		}

		// 파싱 성공
		if(isNaN(date) === false && isNaN(date.getDate()) === false){ 
			return date;
		}
		return false;
	};

	var getFormattedDate = function(date, date_format) {
		if(date == null){
			date = new Date();
		}

   // 년도, 달 , 일 , 시 , 분 객체 생성 
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var hou = date.getHours();
		var min = date.getMinutes();

		date_format = date_format.replace(/YYYY/gi, y)
		.replace(/YY/g, y - 2000)/* 세기 */
		.replace(/MM/g, zpadding(m))
		.replace(/M/g, m)
		.replace(/DD/g, zpadding(d))
		.replace(/D/g, d)
		.replace(/hh/g, zpadding(hou))
		.replace(/h/g, hou)
		.replace(/mm/g, zpadding(min))
		.replace(/m/g, min);
		return date_format;
	};

	var outputToInputObject = function($picker) {
		var $inp = getPickersInputObject($picker);
		if ($inp == null) {
			return;
		}
		var date = getPickedDate($picker);
		var locale = $picker.data("locale");
		var format = getDateFormat($picker.data("dateFormat"), locale, $picker.data('dateOnly'));
		
		var old = $inp.val();                        
		$inp.val(getFormattedDate(date, format));
		if (old != $inp.val()) { // loop상태를 피하기 위해 실제 변경된 경우에만 트리거
			$inp.trigger("change");
		}
	};

	var getPickedDate = function($obj) {
		var $picker = getParentPickerObject($obj);
		return $picker.data("pickedDate");
	};

	var zpadding = function(num) {
		num = ("0" + num).slice(-2);
		return num;
	};

	var draw_date = function($picker, option, date) {
		draw($picker, option, date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
	};
	var translate = function(locale, s) {
		if (typeof lang[locale][s] !== "undefined"){
			return lang[locale][s];
		}
		return lang.en[s];
	};
	var draw = function($picker, option, year, month, day, hour, min) {
		var date = new Date();

		if (hour != null) {
			date = new Date(year, month, day, hour, min, 0);
		} else if (year != null) {
			date = new Date(year, month, day);
		} else {
			date = new Date();
		}

		/* 현재 날짜 보여줌 */
		var isTodayButton = $picker.data("todayButton");
		var isScroll = option.isAnim; 
		if($picker.data("timelistScroll") === false) { 
			isScroll = false;
		}

		var isAnim = option.isAnim;
		if($picker.data("animation") === false){ 
			isAnim = false;
		}

		/* 최소 날짜 , 최대 날짜 , 시간 간격 , w의 첫째날 객체 생성 */
		var isFutureOnly = $picker.data("futureOnly");
		var minDate = $picker.data("minDate");
		var maxDate = $picker.data("maxDate");
		var isOutputToInputObject = option.isOutputToInputObject;
		var minuteInterval = $picker.data("minuteInterval");
		var firstDayOfWeek = $picker.data("firstDayOfWeek");

		var allowWdays = $picker.data("allowWdays");
		if (allowWdays == null || isObj('Array', allowWdays) === false || allowWdays.length <= 0) {
			allowWdays = null;
		}
		
		/* 예약 최소, 최대시간*/
		var minTime = $picker.data("minTime");
		var maxTime = $picker.data("maxTime");

		/* 특정 날짜 확인 */
		var todayDate = new Date();
		if (isFutureOnly) {
			if (date.getTime() < todayDate.getTime()) { 
				date.setTime(todayDate.getTime());
			}
		}
		if(allowWdays != null && allowWdays.length <= 6) {
			while (true) {
				if ($.inArray(date.getDay(), allowWdays) == -1) {
					date.setDate(date.getDate() + 1);
				} else {
					break;
				}
			}
		}
		
		var locale = $picker.data("locale");
		if (!lang.hasOwnProperty(locale)) {
			locale = 'en';
		}

		/* 날짜 계산 */
		var firstWday = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - firstDayOfWeek;
		var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		var beforeMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
		var dateBeforeMonth = new Date(date.getFullYear(), date.getMonth(), 0);
		var dateNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);
		var isCurrentYear = todayDate.getFullYear() == date.getFullYear();
		var isCurrentMonth = isCurrentYear && todayDate.getMonth() == date.getMonth();
		var isCurrentDay = isCurrentMonth && todayDate.getDate() == date.getDate();
		var isPastMonth = false;
		if (date.getFullYear() < todayDate.getFullYear() || (isCurrentYear && date.getMonth() < todayDate.getMonth())) {
			isPastMonth = true;
		}

		/* 각 객체 선언 */
		var $header = $picker.children('.datepicker_header');
		var $inner = $picker.children('.datepicker_inner_container');
		var $calendar = $picker.children('.datepicker_inner_container').children('.datepicker_calendar');
		var $table = $calendar.children('.datepicker_table');
		var $timelist = $picker.children('.datepicker_inner_container').children('.datepicker_timelist');

		/* 선택한 날짜에 따라 맞게 바뀌기 */
		var changePoint = "";
		var oldDate = getPickedDate($picker);
		if(oldDate != null){
			if(oldDate.getMonth() != date.getMonth() || oldDate.getDate() != date.getDate()){
				changePoint = "calendar";
			} else if (oldDate.getHours() != date.getHours() || oldDate.getMinutes() != date.getMinutes()){
				if(date.getMinutes() === 0 || date.getMinutes() % minuteInterval === 0){
					changePoint = "timelist";
				}
			}
		}

		/* 선택한 날짜 저장 */
		$($picker).data("pickedDate", date);

		/* Remind timelist scroll state */
		var drawBefore_timeList_scrollTop = $timelist.scrollTop();

		/* New 시간 List  */
		var timelist_activeTimeCell_offsetTop = -1;

		/* Header */
		$header.children().remove();

		var cDate =  new Date(date.getTime());
		cDate.setMinutes(59);
		cDate.setHours(23);
		cDate.setSeconds(59);
		cDate.setDate(0); // 전 달의 마지막 날

		var $link_before_month = null;
		if ((!isFutureOnly || !isCurrentMonth) && ((minDate == null) || (minDate < cDate.getTime()))
		) {
			$link_before_month = $('<a>');
			$link_before_month.text('<');
			$link_before_month.prop('alt', translate(locale,'prevMonth'));
			$link_before_month.prop('title', translate(locale,'prevMonth') );
			$link_before_month.click(function() {
				beforeMonth($picker);
			});
			$picker.data('stateAllowBeforeMonth', true);
		} else {
			$picker.data('stateAllowBeforeMonth', false);
		}

		cDate.setMinutes(0);
		cDate.setHours(0);
		cDate.setSeconds(0);
		cDate.setDate(1); // 다음 달의 첫 날
		cDate.setMonth(date.getMonth() + 1);

		var $now_month = $('<span>');
		$now_month.text(date.getFullYear() + " " + translate(locale, 'sep') + " " + translate(locale, 'months')[date.getMonth()]);

		var $link_next_month = null;
		if ((maxDate == null) || (maxDate > cDate.getTime())) {
			$link_next_month = $('<a>');
			$link_next_month.text('>');
			$link_next_month.prop('alt', translate(locale,'nextMonth'));
			$link_next_month.prop('title', translate(locale,'nextMonth'));
			$link_next_month.click(function() {
				nextMonth($picker);
			});
		}
		
		if ($link_before_month != null) {
			$header.append($link_before_month);
		}
		$header.append($now_month);
		if ($link_next_month != null) {
			$header.append($link_next_month);
		}

		/* Calendar 출력 */
		$table.children().remove();
		var $tr = $('<tr>');
		$table.append($tr);

		/* week 출력 */
		var firstDayDiff = 7 + firstDayOfWeek;
		var daysOfWeek = translate(locale,'days');
		var $td;
		for (var i = 0; i < 7; i++) {
			$td = $('<th>');
			$td.text(daysOfWeek[((i + firstDayDiff) % 7)]);
			$tr.append($td);
		}

		/* day 출력 */
		var cellNum = Math.ceil((firstWday + lastDay) / 7) * 7;
		i = 0;
		if(firstWday < 0){
			i = -7;
		}
		var realDayObj =  new Date(date.getTime());
		realDayObj.setHours(0);
		realDayObj.setMinutes(0);
		for (var zz = 0; i < cellNum; i++) {
			var realDay = i + 1 - firstWday;

			var isPast = isPastMonth || (isCurrentMonth && realDay < todayDate.getDate());

			if (i % 7 === 0) {
				$tr = $('<tr>');
				$table.append($tr);
			}

			$td = $('<td>');
			$td.data("day", realDay);

			$tr.append($td);

			if (firstWday > i) { /* 전 달 */
				$td.text(beforeMonthLastDay + realDay);
				$td.addClass('day_another_month');
				$td.data("dateStr", dateBeforeMonth.getFullYear() + "/" + (dateBeforeMonth.getMonth() + 1) + "/" + (beforeMonthLastDay + realDay));
				realDayObj.setDate(beforeMonthLastDay + realDay);
				realDayObj.setMonth(dateBeforeMonth.getMonth() );
				realDayObj.setYear(dateBeforeMonth.getFullYear() );
			} else if (i < firstWday + lastDay) { /* 현재 달 */
				$td.text(realDay);
				$td.data("dateStr", (date.getFullYear()) + "/" + (date.getMonth() + 1) + "/" + realDay);
				realDayObj.setDate( realDay );
				realDayObj.setMonth( date.getMonth()  );
				realDayObj.setYear( date.getFullYear() );
			} else { /* 다음 달 */
				$td.text(realDay - lastDay);
				$td.addClass('day_another_month');
				$td.data("dateStr", dateNextMonth.getFullYear() + "/" + (dateNextMonth.getMonth() + 1) + "/" + (realDay - lastDay));
				realDayObj.setDate( realDay - lastDay );  
				realDayObj.setMonth( dateNextMonth.getMonth() );
				realDayObj.setYear( dateNextMonth.getFullYear() );
			}

			/* week 확인 */
			var wday = ((i + firstDayDiff) % 7);
			if(allowWdays != null) {
				if ($.inArray(wday, allowWdays) == -1) {
					$td.addClass('day_in_unallowed');
					continue; 
				}
			} else if (wday === 0) { /* 0=일요일 */
				$td.addClass('wday_sun');
			} else if (wday == 6) { /* 6=토요일 */
				$td.addClass('wday_sat');
			}

			/* 선택된 날짜 */
			if (realDay == date.getDate()) {
				$td.addClass('active');
			}

			/* 오늘 */
			if (isCurrentMonth && realDay == todayDate.getDate()) { 
				$td.addClass('today');
			}

			
			if (
				// 날짜와 시간 선택했을 때 input field에 나오게 함
				((minDate != null) && (minDate > realDayObjMN.getTime())) || ((maxDate != null) && (maxDate < realDayObj.getTime())) // compare to 00:00:00
			) { 
				$td.addClass('out_of_range');
			} else if (isFutureOnly && isPast) { 
				$td.addClass('day_in_past');
			} else {
				$td.click(function() {
					if ($(this).hasClass('hover')) {
						$(this).removeClass('hover');
					}
					$(this).addClass('active');

					var $picker = getParentPickerObject($(this));
					var targetDate = new Date($(this).data("dateStr"));
					var selectedDate = getPickedDate($picker);
					draw($picker, {
						"isAnim": false,
						"isOutputToInputObject": true
					}, targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), selectedDate.getHours(), selectedDate.getMinutes());
										
				});

				$td.hover(function() {
					if (! $(this).hasClass('active')) {
						$(this).addClass('hover');
					}
				}, function() {
					if ($(this).hasClass('hover')) {
						$(this).removeClass('hover');
					}
				});
			}
		}
		
		if ($picker.data("dateOnly") === true) {
			$timelist.css("display", "none");
		} else {
			/* 시간 List */
			$timelist.children().remove();

			/* 시간 List 높이 맞추기 */
			if ($calendar.innerHeight() > 0) {
				$timelist.css("height", $calendar.innerHeight() - 10 + 'px');
			}
			realDayObj =  new Date(date.getTime());
			$timelist.css("height", $calendar.innerHeight() - 10 + 'px');

			/* 시간 셀 */
			var hour_ = minTime[0];
			var min_ = minTime[1];

			while( hour_*100+min_ < maxTime[0]*100+maxTime[1] ){

				var $o = $('<div>');
				var is_past_time = hour_ < todayDate.getHours() || (hour_ == todayDate.getHours() && min_ < todayDate.getMinutes());
				var is_past = isCurrentDay && is_past_time;
				
				$o.addClass('timelist_item');
				$o.text(zpadding(hour_) + ":" + zpadding(min_));

				$o.data("hour", hour_);
				$o.data("min", min_);

				$timelist.append($o);

				realDayObj.setHours(hour_);
				realDayObj.setMinutes(min_);

				if (
					((minDate != null) && (minDate > realDayObj.getTime())) || ((maxDate != null) && (maxDate < realDayObj.getTime()))
				) { 
					$o.addClass('out_of_range');
				} else if (isFutureOnly && is_past) { 
					$o.addClass('time_in_past');
				} else { 
					$o.click(function() {
						if ($(this).hasClass('hover')) {
							$(this).removeClass('hover');
						}
						$(this).addClass('active');

						var $picker = getParentPickerObject($(this));
						var date = getPickedDate($picker);
						var hour = $(this).data("hour");
						var min = $(this).data("min");
						draw($picker, {
							"isAnim": false,
							"isOutputToInputObject": true
						}, date.getFullYear(), date.getMonth(), date.getDate(), hour, min);
					});

					$o.hover(function() {
						if (! $(this).hasClass('active')) {
							$(this).addClass('hover');
						}
					}, function() {
						if ($(this).hasClass('hover')) {
							$(this).removeClass('hover');
						}
					});
				}
				
				if (hour_ == date.getHours() && min_ == date.getMinutes()) { /* selected time */
					$o.addClass('active');
					timelist_activeTimeCell_offsetTop = $o.offset().top;
				}

				min_ += minuteInterval;
				if (min_ >= 60){
					min_ = min_ - 60;
					hour_++;
				}
				
			}

			/* 시간 스크롤 */
			if(isScroll === true){
				$timelist.scrollTop(timelist_activeTimeCell_offsetTop - $timelist.offset().top);
			}else{
				$timelist.scrollTop(drawBefore_timeList_scrollTop);
			}
		}
		
		/* input-field에 결과값 출력 */
		if (isOutputToInputObject === true) {
			outputToInputObject($picker);
		}
	};
	
	var init = function($obj, opt) {
		var $picker = $('<div>');

		$picker.addClass('datepicker');
		$obj.append($picker);

		/* 현재 날짜 */
		if(!opt.current) {
			opt.current = new Date();
		} else {
			var format = getDateFormat(opt.dateFormat, opt.locale, opt.dateOnly);
			var date = parseDate(opt.current, format);
			if (date) {
				opt.current = date;
			} else {
				opt.current = new Date();
			}
		}

		/* 각 옵션들 객체 생성  */
		if (opt.inputObjectId != null) {
			$picker.data("inputObjectId", opt.inputObjectId);
		}
		$picker.data("dateOnly", opt.dateOnly);
		$picker.data("pickerId", PickerObjects.length);
		$picker.data("dateFormat", opt.dateFormat);
		$picker.data("locale", opt.locale);
		$picker.data("firstDayOfWeek", opt.firstDayOfWeek);
		$picker.data("animation", opt.animation);
		$picker.data("closeOnSelected", opt.closeOnSelected);
		$picker.data("timelistScroll", opt.timelistScroll);
		$picker.data("calendarMouseScroll", opt.calendarMouseScroll);
		$picker.data("todayButton", opt.todayButton); 
		$picker.data('futureOnly', opt.futureOnly);
		$picker.data('onShow', opt.onShow);
		$picker.data('onHide', opt.onHide);
		$picker.data('onInit', opt.onInit);
		$picker.data('allowWdays', opt.allowWdays);

		/* 최소 날짜 */
		var minDate = Date.parse(opt.minDate);
		if (isNaN(minDate)) { 
			$picker.data('minDate', null); 
		} else {
			$picker.data('minDate', minDate);
		}

		/* 최대 날짜 */
		var maxDate = Date.parse(opt.maxDate);
		if (isNaN(maxDate)) { 
			$picker.data('maxDate', null);  
		} else {
			$picker.data('maxDate', maxDate);
		}
		$picker.data("state", 0);

		if( 5 <= opt.minuteInterval && opt.minuteInterval <= 30 ){
			$picker.data("minuteInterval", opt.minuteInterval);
		} else {
			$picker.data("minuteInterval", 30);
		}
			opt.minTime = opt.minTime.split(':');	
			opt.maxTime = opt.maxTime.split(':');

		if(! ((opt.minTime[0] >= 0 ) && (opt.minTime[0] <24 ))){
			opt.minTime[0]="00";
		}	
		if(! ((opt.maxTime[0] >= 0 ) && (opt.maxTime[0] <24 ))){
			opt.maxTime[0]="23";
		}
		if(! ((opt.minTime[1] >= 0 ) && (opt.minTime[1] <60 ))){
			opt.minTime[1]="00";
		}	
		if(! ((opt.maxTime[1] >= 0 ) && (opt.maxTime[1] <24 ))){
			opt.maxTime[1]="59";
		}
		opt.minTime[0]=parseInt(opt.minTime[0]);
		opt.minTime[1]=parseInt(opt.minTime[1]);
		opt.maxTime[0]=parseInt(opt.maxTime[0]);
		opt.maxTime[1]=parseInt(opt.maxTime[1]);
		$picker.data('minTime', opt.minTime);
		$picker.data('maxTime', opt.maxTime);
		
		/* 헤더 */
		var $header = $('<div>');
		$header.addClass('datepicker_header');
		$picker.append($header);

		/* 내부 Container*/
		var $inner = $('<div>');
		$inner.addClass('datepicker_inner_container');
		$picker.append($inner);

		/* 달력 */
		var $calendar = $('<div>');
		$calendar.addClass('datepicker_calendar');
		var $table = $('<table>');
		$table.addClass('datepicker_table');
		$calendar.append($table);
		$inner.append($calendar);

		/* 시간 List */
		var $timelist = $('<div>');
		$timelist.addClass('datepicker_timelist');
		$inner.append($timelist);

		/* 이벤트 핸들러 */
		$picker.hover(
			function(){
				ActivePickerId = $(this).data("pickerId");
			},
			function(){
				ActivePickerId = -1;
			}
		);

		PickerObjects.push($picker);
		draw_date($picker, {
			"isAnim": true,
			"isOutputToInputObject": opt.autodateOnStart
		}, opt.current);
	};
	
	/* 객체들 리턴값 */
	var getDefaults = function() {
		return {
			"current": null,
			"dateFormat": "default",
			"locale": "en",
			"animation": true,
			"minuteInterval": 30,
			"firstDayOfWeek": 0,
			"closeOnSelected": false,
			"timelistScroll": true,
			"calendarMouseScroll": true,
			"todayButton": true,
			"dateOnly": false,
			"futureOnly": false,
			"minDate" : null,
			"maxDate" : null,
			"autodateOnStart": true,
			"minTime":"10:00",
			"maxTime":"20:00",
			"onShow": null,
			"onHide": null,
			"allowWdays": null
		};
	};
	
	/* 초기화 */
	 $.fn.dtpicker = function(config) {
		var date = new Date();
		var defaults = getDefaults();
		
		defaults.inputObjectId = undefined;
		var options = $.extend(defaults, config);

		return this.each(function(i) {
			init($(this), options);
		});
	 };

	/* DateTimePicker 초기화 */
	 $.fn.appendDtpicker = function(config) {
		var date = new Date();
		var defaults = getDefaults();
		
		defaults.inline = false;
		var options = $.extend(defaults, config);

		return this.each(function(i) {
			var input = this;
			if(0 < $(PickerObjects[$(input).data('pickerId')]).length) {
				console.log("dtpicker - Already exist appended picker");
				return;
			}

			/* input-field에 inputsObjects 배열 추가 */
			var inputObjectId = InputObjects.length;
			InputObjects.push(input);

			options.inputObjectId = inputObjectId;

			/* 현재 날짜 */
			var date, strDate, strTime;
			if($(input).val() != null && $(input).val() !== ""){
				options.current = $(input).val();
			}

			/* parent-div */
			var $d = $('<div>');
			if(options.inline){ 
				$d.insertAfter(input);	
			} else { 
				$d.css("position","absolute");
				$('body').append($d);
			}

			/* 초기화 */
			var pickerId = PickerObjects.length;
			var $picker_parent = $($d).dtpicker(options);
			var $picker = $picker_parent.children('.datepicker');

			$(input).data('pickerId', pickerId);
			$(input).keyup(function() {
				var $input = $(this);
				var $picker = $(PickerObjects[$input.data('pickerId')]);
				if ($input.val() != null && (
					$input.data('beforeVal') == null ||
					( $input.data('beforeVal') != null && $input.data('beforeVal') != $input.val())	)
					) { 
					var format = getDateFormat($picker.data('dateFormat'), $picker.data('locale'), $picker.data('dateOnly'));
					var date = parseDate($input.val(), format);
					if (date) {
						draw_date($picker, {
							"isAnim":true,
							"isOutputToInputObject":false
						}, date);
					}
				}
				$input.data('beforeVal', $input.val());
			});

			$(input).change(function(){
				$(this).trigger('keyup');
			});

			/* handler 객체 생성*/
			var handler = new PickerHandler($picker, $(input));
			if(options.inline === true){
				$picker.data('isInline',true);
			} else {
				$picker.data('isInline',false);
				$picker_parent.css({
					"zIndex": 100
				});
				$picker.css("width","auto");
				$picker.hide();
				
				/* input-field 클릭했을 때 */
				$(input).on('click, focus',function(){
					var $input = $(this);
					var $picker = $(PickerObjects[$input.data('pickerId')]);
					var handler = new PickerHandler($picker, $input);
					var is_showed = handler.isShow();
					if (!is_showed) {
						handler.show();
					}
				});	
			}
		});
	};

	/* DateTimePicker */
	var methods = {
		show : function( ) {
			var $input = $(this);
			var $picker = $(PickerObjects[$input.data('pickerId')]);
			if ($picker != null) {
				var handler = new PickerHandler($picker, $input);
				// Show a picker
				handler.show();
			}
		},
		/* 날짜 set */
		setDate : function( date ) {
			var $input = $(this);
			var $picker = $(PickerObjects[$input.data('pickerId')]);
			if ($picker != null) {
				var handler = new PickerHandler($picker, $input);
				handler.setDate(date);
			}
		},
		/* 날짜 가져옴 */
		getDate : function( ) {
			var $input = $(this);
			var $picker = $(PickerObjects[$input.data('pickerId')]);
			if ($picker != null) {
				var handler = new PickerHandler($picker, $input);
				return handler.getDate();
			}
		},
	};
})(jQuery);
