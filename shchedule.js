$(document).ready(function ()
{
    general();
    ds = new Date();
    de = new Date();
    jqxhr = '',jqxhrNW = '';
    cookieTimeLive = '';
    cookieCurrentSchedule = getCookie('CurrentSchedule');
    if (cookieCurrentSchedule == 'exam') {   //временно
        setCookie('CurrentSchedule','lesson',1);
    }

    cookieTypeSchedule = getCookie('StudPrepAudit');
    cookieDivStuds = getCookie('divisionStuds');
    cookieKurs = getCookie('kurs');
    cookieGroup = getCookie('group');
    cookieDivPreps = getCookie('divisionPreps');
    cookiePrep = getCookie('prep');
    cookieKaf = getCookie('kafedra');
    cookieKorpus = getCookie('korpus');
    cookieAudit = getCookie('audit');

    TimeTableMain = ['8:30 – 10:00', '10:10 – 11:40', '12:00 – 13:30', '13:40 – 15:10', '15:20 – 16:50', '17:00 – 18:30', '18:40 – 20:10', '20:15 – 21:45'];
    TimeTableSat = ['8:30 – 10:00', '10:10 – 11:40', '12:00 – 13:30', '13:40 – 15:10', '15:20 – 16:50', '17:00 – 18:30'];
    startExam = ['9:00','9:00','13:00','13:00','16:00','17:00','18:40'];
    var CurrentWeekDay = ds.getDay();
    WeekDay = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    $('#today_date').append('Сегодня '+WeekDay[CurrentWeekDay]+', '+ds.getDate()+'.'+addZeroToMonth(1*ds.getMonth()+1)+'.'+ds.getFullYear()+'.&nbsp;');
    CurrentWeekStart = ds.getTime()+86400000-86400000*ds.getDay();   //находим день, 86400000 - одни сутки в миллисекундах, в воскресенье будет отображаться расписание на следующую неделю
    CurrentWeekStart = (CurrentWeekStart-(ds.getTimezoneOffset()*60000))-(3600*ds.getHours()+60*ds.getMinutes()+(1*ds.getSeconds()))*1000; //находим начало дня
    ds.setTime(CurrentWeekStart);
    CurrentWeekEnd = CurrentWeekStart + 518400000;
    de.setTime(CurrentWeekEnd);
    NowWeekStart = CurrentWeekStart;
    NowWeekEnd = CurrentWeekEnd;
    $('.week-schedule').append('Неделя: '+ds.getDate()+'.'+addZeroToMonth(1*ds.getMonth()+1)+'.'+ds.getFullYear()+' - '+de.getDate()+'.'+addZeroToMonth(1*de.getMonth()+1)+'.'+de.getFullYear());
    getNumberWeek(CurrentWeekStart);

    if (!cookieCurrentSchedule) {
        setCookie('CurrentSchedule','lesson',1);
    }
    /*else if (cookieCurrentSchedule == 'exam'){
       changeSchedule('lesson');
}*/

    existCookie();
});

/* Набор обработчиков и команд, общих для нескольких элементов */
function general() {
    /* Обработчик кликов по вкладкам */
    $('.schedule-select .nav-tabs li').click(function() {
        $('.schedule-content').hide();
        $('#title_schedule').text('');
        $('#schedule_table').children().remove();
    });

    /* Обработчик кликов по всем кнопкам выборки */
    $('.schedule-select .panel-body .btn').live('click',function() {
        $('.schedule-content').hide();
        var el = $(this);
        el.addClass('active').siblings().removeClass('active');
        var val = el.data('value');
        /* набор действий для элементов выборки в зависимости от id */
        switch(el.parents('.panel').attr('id')){
            case 'divisionStuds':
                kursList(val);
                $('#stud_tab #kurs .panel-title a').click();
                deleteCookie('divisionStuds');
                deleteCookie('kurs');
                deleteCookie('group');
                $('#kurs .panel-body').children().remove();
                $('#group .panel-body').children().remove();
                break;

            case 'kurs':
                groupList(val);
                $('#stud_tab #group .panel-title a').click();
                deleteCookie('divisionStuds');
                deleteCookie('kurs');
                deleteCookie('group');
                $('#group .panel-body').children().remove();
                break;

            case 'group':
                setCookie('divisionStuds',$('#divisionStuds .panel-body .btn.active').data('value'),0);
                setCookie('kurs', $('#kurs .panel-body .btn.active').data('value'), 1);
                setCookie('group', $('#group .panel-body .btn.active').data('value'), 1);
                $('#stud_tab #group .panel-title a').click();
                printScheduleStuds(val);
                break;

            case 'divisionPreps':
                kafList(val);
                $('#prep_tab #kafedra .panel-title a').click();
                deleteCookie('divisionPreps');
                deleteCookie('kafedra');
                deleteCookie('prep');
                $('#kafedra .panel-body').children().remove();
                $('#prep .panel-body').children().remove();
                break;

            case 'kafedra':
                prepList(val);
                $('#prep_tab #prep .panel-title a').click();
                deleteCookie('divisionPreps');
                deleteCookie('kafedra');
                deleteCookie('prep');
                $('#prep .panel-body').children().remove();
                break;

            case 'prep':
                setCookie('divisionPreps', $('#divisionPreps .panel-body .btn.active').data('value'), 1);
                setCookie('kafedra', $('#kafedra .panel-body .btn.active').data('value'), 1);
                setCookie('prep', $('#prep .panel-body .btn.active').data('value'), 1);
                $('#prep_tab #prep .panel-title a').click();
                printSchedulePreps(val);
                break;

            case 'korpus':
                auditList(val);
                $('#audit_tab #audit .panel-title a').click();
                deleteCookie('korpus');
                deleteCookie('audit');
                $('#audit .panel-body').children().remove();
                break;

            case 'audit':
                setCookie('korpus', $('#korpus .panel-body .btn.active').data('value'), 1);
                setCookie('audit', $('#audit .panel-body .btn.active').data('value'), 1);
                $('#audit_tab #audit .panel-title a').click();
                printScheduleAudits(val);
                break;
        }
        $('#title_schedule').text('');
        $('#schedule_table').children().remove();
    });
}

function toggleFilter() {
    /* Плавный переход к schedule-select -->*/
    $('body,html').animate({scrollTop: $('.schedule-select').offset().top}, 500);
    /* <-- Плавный переход к .schedule-select */

    $('.schedule-select').slideToggle();
    $('.schedule-select-toggle i').toggleClass('fa-chevron-circle-up').toggleClass('fa-chevron-circle-down');
}

function addZeroToMonth(month) // преобразование из формата 29.1.2015 к формату 29.01.2015 (добавлем ноль к месяцу)
{
    if (month <10) {
        month = '0'+month;
    }
    return month;
}

function getNumberWeek(WeekStart)
{
    WeekNum = '';
    jqxhrNW ? jqxhrNW.abort() : '';
    jqxhrNW = $.ajax({
        url: '/schedule/'+WeekStart+'/numberweek',
        success: function (data)
        {
            if (data[0]) {
                //WeekNum = data[0]['NumberWeek'];
                WeekNum = data[0]['computed'];
                if (WeekNum < 1) {
                    WeekNum = 1*WeekNum-1;//так надо...(не должно быть нулевой недели)
                }
                $('.week-schedule').append(' <span class="badge badge-theme">'+WeekNum+'</span>');
            }
        }
    });
}

/* Проверка установленных кук */
function existCookie()
{
    /* def-переменные - задают последовательность выполнения */
    switch (cookieTypeSchedule) {
        //Студент
        case '1':
            var def1 = scheduleStuds();
            def1.done(function(){
                if (cookieDivStuds&&cookieKurs&&cookieGroup) {
                    var def2 = groupList(cookieKurs);
                    def2.done(function() {
                        printScheduleStuds(cookieGroup);
                    });
                    kursList(cookieDivStuds);
                }
            });
            break;
        //Преподаватель
        case '2':
            schedulePreps();
            if (cookieDivPreps&&cookieKaf&&cookiePrep) {
                var def3 = prepList(cookieKaf);
                def3.done(function(){
                    printSchedulePreps(cookiePrep);
                });
                kafList(cookieDivPreps);
            }
            break;
        //Аудитория
        case '3':
            scheduleAudits();
            if (cookieKorpus&&cookieAudit) {
                var def4 = auditList(cookieKorpus);
                def4.done(function(){
                    printScheduleAudits(cookieAudit);
                });
            }
            break;
        default:
            $('.schedule-select .nav-tabs li a').first().click(); //если не установлена кука с типом расписания, устанавливаем по умолчанию расписание студентов
            break;
    }
}

function getCookie(name)
{
    var cookie = " " + document.cookie;
    var search = " " + name + "=";
    var setStr = null;
    var offset = 0;
    var end = 0;
    if (cookie.length > 0) {
        offset = cookie.indexOf(search);
        if (offset != -1) {
            offset += search.length;
            end = cookie.indexOf(";", offset)
            if (end == -1) {
                end = cookie.length;
            }
            setStr = unescape(cookie.substring(offset, end));
        }
    }
    return(setStr);
}

function setCookie(name, value, typeCookies) //третий параметр служит для определения, какое из полей выбрано. Сделано для того, чтобы время хранения кук для всех полей было одинаковым. Есть 2 варианта - 0 и 1, для всех единиц будут установлены куки, соответсвующие нулям.
{
    var cookieLive = new Date();
    if ((typeCookies == 0)||(!cookieTimeLive)) {
        cookieLive.setTime(cookieLive.getTime()+4838400000);    //устанавливаем все куки на четыре недели
        cookieTimeLive = cookieLive.toGMTString();
    }
    document.cookie = name + '=' + escape(value) + '; expires='+cookieTimeLive+'; path=/schedule';
    changeCookieVariable(name, value);
}

/* Изменяет значение переменной для замененной куки */
function changeCookieVariable(name, value) {
    switch (name) {
        case 'CurrentSchedule':cookieCurrentSchedule = value; break;
        case 'StudPrepAudit':cookieTypeSchedule = value; break;
        case 'divisionStuds':cookieDivStuds = value; break;
        case 'kurs':cookieKurs = value; break;
        case 'group':cookieGroup = value; break;
        case 'divisionPreps':cookieDivPreps = value; break;
        case 'kafedra':cookieKaf = value; break;
        case 'prep':cookiePrep = value; break;
        case 'korpus':cookieKorpus = value; break;
        case 'audit':cookieAudit = value; break;
    }
}

function deleteCookie (name)
{
    var cookieLive = new Date();
    cookieLive.setTime(cookieLive.getTime()-1);   //для удаления куки устанавливаем её время на секунду раньше, чем сейчас
    document.cookie = name + "=; expires=" + cookieLive.toGMTString()+'; path=/schedule';
    changeCookieVariable (name, '');
}

function stopAjax()
{
    jqxhr ? jqxhr.abort() : '';
}

function scheduleStuds ()
{
    setCookie('StudPrepAudit', '1', 0);
    var def = $.Deferred();
    if ($('#divisionStuds .panel-body').children().is('.btn')) {
        def.resolve();
        return def;
    }
    //$('#loader_select').show();
    $('#title_schedule').text('');
    $('#schedule_table').children().remove();
    /*stopAjax();
    jqxhr = */$.ajax({
    url: '/schedule/divisionlistforstuds',
    success: function (data)
    {
        var countElem = data.length;
        var btnsHtml = '';
        for (var i=0; i<countElem;i++) {
            btnsHtml += '<button type="button" class="btn btn-primary btn-lg" title="'+data[i]['titleDivision']+'" data-value="'+data[i]['idDivision']+'">'+data[i]['shortTitle']+'</button>';
        }
        $('#stud_tab #divisionStuds .panel-body').append(btnsHtml);
        if (cookieDivStuds) {
            $('#stud_tab #divisionStuds .panel-body .btn[data-value="'+cookieDivStuds+'"]').addClass('active');
        }
        def.resolve();
    }
});

    return def;
}

function kursList (val)
{
    var def = $.Deferred();
    //$('#loader_select').show();
    /*stopAjax();
    jqxhr = */$.ajax({
    url: '/schedule/'+val+'/kurslist',
    success: function (data)
    {
        var countElem = data.length;
        var btnsHtml = '';
        for (var i=0; i<countElem; i++) {
            btnsHtml += '<button type="button" class="btn btn-primary btn-lg" data-value="'+data[i]['kurs']+'">'+data[i]['kurs']+'</button>';
        }
        $('#stud_tab #kurs .panel-body').append(btnsHtml);
        if (cookieKurs) {
            $('#stud_tab #kurs .panel-body .btn[data-value="'+cookieKurs+'"]').addClass('active');
        }
        def.resolve();
    }
});

    return def;
}

function groupList(val)
{
    var def = $.Deferred();
    //$('#loader_select').show();
    var division = $('#divisionStuds .panel-body .btn.active').data('value');
    /*stopAjax();
     jqxhr = */$.ajax({
    url: '/schedule/'+division+'/'+val+'/grouplist',
    success: function (data)
    {
        var countElem = data.length;
        var btnsHtml = new Object();
        for (var i=0; i<countElem; i++) {
            if (typeof btnsHtml[data[i]['levelEducation']] !== 'undefined') {
                btnsHtml[data[i]['levelEducation']] += '<button type="button" class="btn btn-primary btn-lg" data-value="'+data[i]['idgruop']+'" data-direction="'+data[i]['Codedirection']+'">'+data[i]['title']+'</button>';
            }
            else {
                btnsHtml[data[i]['levelEducation']] = '<button type="button" class="btn btn-primary btn-lg" data-value="'+data[i]['idgruop']+'" data-direction="'+data[i]['Codedirection']+'">'+data[i]['title']+'</button>';
            }
        }
        $.each(btnsHtml,function(key,value){
            $('#stud_tab #group .panel-body').append('<h4 class="text-highlight">'+key+'</h4>');
            $('#stud_tab #group .panel-body').append(value);
        });
        if (cookieGroup) {
            $('#stud_tab #group .panel-body .btn[data-value="'+cookieGroup+'"]').addClass('active');
        }
        def.resolve();
    }
});

    return def;
}

function schedulePreps ()
{
    setCookie('StudPrepAudit', '2', 0);
    var def = $.Deferred();
    if ($('#divisionPreps .panel-body').children().is('.btn')) {
        def.resolve();
        return def;
    }
    //$('#loader_select').show();
    $('#title_schedule').text('');
    $('#schedule_table').children().remove();
    /*stopAjax();
    jqxhr = */$.ajax({
    url: '/schedule/divisionlistforpreps',
    success: function (data)
    {
        var countElem = data.length;
        var btnsHtml = '';
        for (var i=0; i<countElem; i++) {
            btnsHtml += '<button type="button" class="btn btn-primary btn-lg" title="'+data[i]['titleDivision']+'" data-value="'+data[i]['idDivision']+'">'+data[i]['shortTitle']+'</button>';
        }
        $('#prep_tab #divisionPreps .panel-body').append(btnsHtml);
        if (cookieDivPreps) {
            $('#prep_tab #divisionPreps .panel-body .btn[data-value="'+cookieDivPreps+'"]').addClass('active');
        }
        def.resolve();
    }
});

    return def;
}

function kafList(val)
{
    var def = $.Deferred();
    //$('#loader_select').show();
    /*stopAjax();
     jqxhr = */$.ajax({
    url: '/schedule/'+val+'/kaflist',
    success: function (data)
    {
        var countElem = data.length;
        var btnsHtml = '';
        for (var i=0; i<countElem; i++) {
            btnsHtml += '<button type="button" class="btn btn-primary btn-lg" data-value="'+data[i]['idDivision']+'">'+data[i]['titleDivision']+'</button>';
        }
        $('#prep_tab #kafedra .panel-body').append(btnsHtml);
        if (cookieKaf) {
            $('#prep_tab #kafedra .panel-body .btn[data-value="'+cookieKaf+'"]').addClass('active');
        }
        def.resolve();
    }
});

    return def;
}

function prepList(val)
{
    var def = $.Deferred();
    //$('#loader_select').show();
    /*stopAjax();
     jqxhr = */$.ajax({
    url: '/schedule/'+val+'/preplist',
    success: function (data)
    {
        var countElem = data.length;
        var btnsHtml = '';
        for (var i=0; i<countElem; i++) {
            btnsHtml += '<button type="button" class="btn btn-primary btn-lg" data-value="'+data[i]['employee_id']+'">'+data[i]['Family']+' '+data[i]['Name'][0]+'.'+data[i]['SecondName'][0]+'.'+'</button>';
        }
        $('#prep_tab #prep .panel-body').append(btnsHtml);
        if (cookiePrep) {
            $('#prep_tab #prep .panel-body .btn[data-value="'+cookiePrep+'"]').addClass('active');
        }
        def.resolve();
    }
});

    return def;
}

function scheduleAudits ()
{
    setCookie('StudPrepAudit', '3', 0);
    var def = $.Deferred();
    if ($('#korpus .panel-body').children().is('.btn')) {
        def.resolve();
        return def;
    }
    //$('#loader_select').show();
    $('#title_schedule').text('');
    $('#schedule_table').children().remove();
    /*stopAjax();
    jqxhr = */$.ajax({
    url: '/schedule/korpuslist',
    success: function (data)
    {
        var countElem = data.length;
        var btnsHtml = '';
        for (var i=0; i<countElem; i++) {
            btnsHtml += '<button type="button" class="btn btn-primary btn-lg" data-value="'+data[i]['Korpus']+'">'+data[i]['Korpus']+'</button>';
        }
        $('#audit_tab #korpus .panel-body').append(btnsHtml);
        if (cookieKorpus) {
            $('#audit_tab #korpus .panel-body .btn[data-value="'+cookieKorpus+'"]').addClass('active');
        }
        def.resolve();
    }
});

    return def;
}

function auditList(val)
{
    var def = $.Deferred();
    //$('#loader_select').show();  
    /*stopAjax();
     jqxhr = */$.ajax({
    url: '/schedule/'+val+'/auditlist',
    success: function (data)
    {
        var countElem = data.length;
        var btnsHtml = '';
        for (var i=0; i<countElem; i++) {
            btnsHtml += '<button type="button" class="btn btn-primary btn-lg" data-value="'+data[i]['NumberRoom']+'">'+data[i]['NumberRoom']+'</button>';
        }
        $('#audit_tab #audit .panel-body').append(btnsHtml);
        if (cookieAudit) {
            $('#audit_tab #audit .panel-body .btn[data-value="'+cookieAudit+'"]').addClass('active');
        }
        def.resolve();
    }
});

    return def;
}

function printHeadOfTable ()
{
    $('#schedule_table').append('<thead>'
        +'<tr>'
        +'<th width="4%">Пара</th>'
        +'<th class="schedule-table-top-header" width="16%">Понедельник</th>'
        +'<th class="schedule-table-top-header" width="16%">Вторник</th>'
        +'<th class="schedule-table-top-header" width="16%">Среда</th>'
        +'<th class="schedule-table-top-header" width="16%">Четверг</th>'
        +'<th class="schedule-table-top-header" width="16%">Пятница</th>'
        +'<th class="schedule-table-top-header" width="16%">Суббота</th>'
        +'</tr>'
        +'</thead>');
    $('#schedule_table').append('<tbody id="schedule_table_tbody"></tbody>');
}

function printScheduleStuds (val)
{
    $('.schedule-content').hide();
    //$('#loader_select').hide();
    //$('#loader').show();
    $('#schedule_table').children().remove();
    if (cookieCurrentSchedule == 'exam') {
        printExamSchedule(val,'studs');
        return;
    }

    stopAjax();
    jqxhr = $.ajax({
        url:'/schedule//'+val+'///'+CurrentWeekStart+'/printschedule',
        success: function (data)
        {
            var PairTime;
            /*if (data != '')
          if ((data[0]['StartDate']!=null)&&(data[0]['FinishDate']!=null))
             $('#session_time').text('Сроки сессии: '+data[0]['StartDate']+' - '+data[0]['FinishDate']);*/

            if (data == '') {
                $('#title_schedule').text('Расписание занятий для группы '+$('#group button[data-value="'+val+'"]').text()+' ('+$('#group button[data-value="'+val+'"]').data('direction')+')'+' на эту неделю не найдено');
            }
            else if (group != '') {
                $('#title_schedule').text('Расписание занятий для группы '+$('#group button[data-value="'+val+'"]').text()+' ('+$('#group button[data-value="'+val+'"]').data('direction')+')');
                printHeadOfTable();
                var k=0;
                var tableHtml = '';
                for (var i=1; i<=8; i++) {
                    tableHtml += '<tr>';
                    for (var j=0; j<=6; j++) {
                        if (j==0) {
                            tableHtml += '<td>'+i+'</td>';
                        }
                        else {
                            if (j!=6) {
                                PairTime = TimeTableMain[i-1];
                            }
                            else {
                                PairTime = TimeTableSat[i-1];
                            }
                            if (data[k]&&(data[k]['DayWeek']==j)&&(data[k]['NumberLesson']==i)) {
                                tableHtml += '<td title="'+PairTime+'">'
                                    +'<h5 class="text-highlight">'+data[k]['TitleSubject']+'</h5>';
                                if (data[k]['special']) {
                                    tableHtml += '<i>('+data[k]['special']+')</i><br />';
                                }
                                tableHtml += ' ('+data[k]['TypeLesson']+')<br />';
                                //только для групп, у которых указан преподаватель
                                if (data[k]['employee_id']) {
                                    tableHtml += '<i class="fa fa-user-o" aria-hidden="true"></i> <a href="/employee/'+data[k]['employee_id']+'" target="_blank">'+data[k]['Family']+' '+data[k]['Name'].substring(0,1)+'.'+data[k]['SecondName'].substring(0,1)+'.</a><br />';
                                }
                                tableHtml += '<b><i class="fa fa-map-marker" aria-hidden="true"></i> '+data[k]['Korpus']+'-'+data[k]['NumberRoom']+'</b>'+'<br />';
                                //для подгрупп
                                if (data[k]['NumberSubGruop'] != 0) {
                                    tableHtml += '<b>'+'Подгруппа '+data[k]['NumberSubGruop']+'</b><br />';
                                }
                                //для случая, когда подгрупп более 1
                                while (data[k+1]&&(data[k+1]['DayWeek']==j)&&(data[k+1]['NumberLesson']==i)) {
                                    //для подгрупп, занятия для которых отличаются лишь аудиторией и(или) преподавателем (например, английский язык)
                                    if ((data[k]['TitleSubject']==data[k+1]['TitleSubject'])&&(data[k]['TypeLesson']==data[k+1]['TypeLesson'])&&(data[k]['special']==data[k+1]['special'])) {
                                        tableHtml += '<hr>'
                                            +'<i class="fa fa-user-o" aria-hidden="true"></i> <a href="/employee/'+data[k+1]['employee_id']+'" target="_blank">'+data[k+1]['Family']+' '+data[k+1]['Name'].substring(0,1)+'.'+data[k+1]['SecondName'].substring(0,1)+'.</a><br />'
                                            +'<b><i class="fa fa-map-marker" aria-hidden="true"></i> '+data[k+1]['Korpus']+'-'+data[k+1]['NumberRoom']+'</b>';
                                        //для подгрупп
                                        if (data[k+1]['NumberSubGruop'] != 0) {
                                            tableHtml += '<br /><b>'+'Подгруппа '+data[k+1]['NumberSubGruop']+'</b><br />';
                                        }
                                    }
                                    else {
                                        tableHtml += '<hr>'
                                            +'<h5 class="text-highlight">'+data[k+1]['TitleSubject']+'</h5>';
                                        if (data[k+1]['special']) {
                                            tableHtml +='<i>('+data[k+1]['special']+')</i><br />';
                                        }
                                        tableHtml += ' ('+data[k+1]['TypeLesson']+')<br />'
                                            +'<i class="fa fa-user-o" aria-hidden="true"></i> <a href="/employee/'+data[k+1]['employee_id']+'" target="_blank">'+data[k+1]['Family']+' '+data[k+1]['Name'].substring(0,1)+'.'+data[k+1]['SecondName'].substring(0,1)+'.</a><br />'
                                            +'<b><i class="fa fa-map-marker" aria-hidden="true"></i> '+data[k+1]['Korpus']+'-'+data[k+1]['NumberRoom']+'</b>';
                                        //для подгрупп
                                        if (data[k+1]['NumberSubGruop'] != 0) {
                                            tableHtml += '<br /><b>'+'Подгруппа '+data[k+1]['NumberSubGruop']+'</b><br />';
                                        }
                                    }
                                    k++;
                                }
                                tableHtml += '</td>';
                                k++;
                            }
                            else tableHtml += '<td></td>';
                        }
                    }
                    tableHtml += '</tr>';
                }
            }
            $('#schedule_table_tbody').append(tableHtml);
            // $('#loader').hide();
            $('.schedule-content').show();
        }
    });
}

function printSchedulePreps (val)
{
    $('.schedule-content').hide();
    //$('#loader_select').hide();
    //$('#loader').show();
    $('#schedule_table').children().remove();
    if (cookieCurrentSchedule == 'exam'){
        printExamSchedule(val,'preps');
        return;
    }

    stopAjax();
    jqxhr = $.ajax({
        url: '/schedule/'+val+'////'+CurrentWeekStart+'/printschedule',
        success: function (data)
        {
            var PairTime;
            if (data == '') {
                $('#title_schedule').text('Расписание занятий для преподавателя '+$('#prep button[data-value="'+val+'"]').text()+' на эту неделю не найдено');
            }
            else if (prep != '') {
                $('#title_schedule').text('Расписание занятий для преподавателя '+$('#prep button[data-value="'+val+'"]').text());
                printHeadOfTable();
                var k=0;
                var tableHtml = '';
                for (var i=1; i<=8; i++) {
                    tableHtml += '<tr>';
                    for (var j=0; j<=6; j++) {
                        if (j==0) {
                            tableHtml += '<th>'+i+'</th>';
                        }
                        else {
                            if (j!=6) {
                                PairTime = TimeTableMain[i-1];
                            }
                            else {
                                PairTime = TimeTableSat[i-1];
                            }
                            if (data[k]&&(data[k]['DayWeek']==j)&&(data[k]['NumberLesson']==i)) {
                                tableHtml += '<td title="'+PairTime+'">'
                                    +'<h5 class="text-highlight">'+data[k]['TitleSubject']+'</h5>';
                                if (data[k]['special']) {
                                    tableHtml += '<i>('+data[k]['special']+')</i><br />';
                                }
                                tableHtml += ' ('+data[k]['TypeLesson']+')'
                                    +'<br />'
                                    +'<i class="fa fa-users" aria-hidden="true"></i> '+data[k]['title']+'<br />'
                                    +'<b><i class="fa fa-map-marker" aria-hidden="true"></i> '+data[k]['Korpus']+'-'+data[k]['NumberRoom']+'</b><br />';
                                if (data[k]['NumberSubGruop']!=0) {
                                    tableHtml += '<b>'+'Подгруппа '+data[k]['NumberSubGruop']+'</b><br />';
                                }
                                while (data[k+1]&&(data[k+1]['DayWeek']==j)&&(data[k+1]['NumberLesson']==i)) {
                                    tableHtml += '<hr>'
                                        +'<h5 class="text-highlight">'+data[k+1]['TitleSubject']+'</h5>';
                                    if (data[k+1]['special']) {
                                        tableHtml += '<i>('+data[k+1]['special']+')</i><br />';
                                    }
                                    tableHtml += ' ('+data[k+1]['TypeLesson']+')<br />'
                                        +'<i class="fa fa-users" aria-hidden="true"></i> '+data[k+1]['title']+'<br />'
                                        +'<b><i class="fa fa-map-marker" aria-hidden="true"></i> '+data[k+1]['Korpus']+'-'+data[k+1]['NumberRoom']+'</b><br />';
                                    if (data[k+1]['NumberSubGruop']!=0) {
                                        tableHtml += '<b>'+'Подгруппа '+data[k+1]['NumberSubGruop']+'</b><br />';
                                    }
                                    k++;
                                }
                                tableHtml += '</td>';
                                k++;
                            }
                            else {
                                // Костыль для отсечения воскресого расписания
                                if (data[k]&&(data[k]['DayWeek'] == 7)) {
                                    k++;
                                }
                                tableHtml += '<td></td>';
                            }

                        }
                    }
                    tableHtml += '</tr>';
                }
            }
            $('#schedule_table_tbody').append(tableHtml);
            //$('#loader').hide();
            $('.schedule-content').show();
        }
    });
}

function printScheduleAudits (val)
{
    $('.schedule-content').hide();
    // $('#loader_select').hide();
    // $('#loader').show();
    var korp = $('#korpus .panel-body .btn.active').data('value');
    $('#schedule_table').children().remove();
    if (cookieCurrentSchedule == 'exam'){
        printExamSchedule(val,'audits');
        return;
    }

    stopAjax();
    jqxhr = $.ajax({
        url: '/schedule///'+korp+'/'+val+'/'+CurrentWeekStart+'/printschedule',
        success: function (data)
        {
            var PairTime;
            if (data == '') {
                $('#title_schedule').text('Расписание занятий в аудитории '+val+' на эту неделю не найдено');
            }
            else if (audit != '') {
                $('#title_schedule').text('Расписание занятий в аудитории '+val);
                printHeadOfTable();
                var k=0;
                var tableHtml = '';
                for (var i=1; i<=8; i++) {
                    tableHtml += '<tr>';
                    for (var j=0; j<=6; j++) {
                        if (j==0) {
                            tableHtml += '<th>'+i+'</th>';
                        }
                        else {
                            if (j!=6) {
                                PairTime = TimeTableMain[i-1];
                            }
                            else {
                                PairTime = TimeTableSat[i-1];
                            }
                            if (data[k]&&(data[k]['DayWeek']==j)&&(data[k]['NumberLesson']==i)) {
                                tableHtml += '<td title="'+PairTime+'">'
                                    +'<h5 class="text-highlight">'+data[k]['TitleSubject']+'</h5>';
                                if (data[k]['special']) {
                                    tableHtml += '<i>('+data[k]['special']+')</i><br />';
                                }
                                tableHtml += ' ('+data[k]['TypeLesson']+')'
                                    +'<br />'
                                    +'<i class="fa fa-users" aria-hidden="true"></i> '+data[k]['title']+'<br />'
                                    +'<i class="fa fa-user-o" aria-hidden="true"></i> <a href="/employee/'+data[k]['employee_id']+'" target="_blank">'+data[k]['Family']+' '+data[k]['Name'].substring(0,1)+'.'+data[k]['SecondName'].substring(0,1)+'.</a>';
                                while (data[k+1]&&(data[k+1]['DayWeek']==j)&&(data[k+1]['NumberLesson']==i)) {
                                    tableHtml += '<hr>'
                                        +'<h5 class="text-highlight">'+data[k+1]['TitleSubject']+'</h5>';
                                    if (data[k]['special']) {
                                        tableHtml += '<i>('+data[k]['special']+')</i><br />';
                                    }
                                    tableHtml += ' ('+data[k+1]['TypeLesson']+')'
                                        +'<br />'
                                        +'<i class="fa fa-users" aria-hidden="true"></i> '+data[k+1]['title']+'<br />'
                                        +'<i class="fa fa-user-o" aria-hidden="true"></i> <a href="/employee/'+data[k+1]['employee_id']+'" target="_blank">'+data[k+1]['Family']+' '+data[k+1]['Name'].substring(0,1)+'.'+data[k+1]['SecondName'].substring(0,1)+'.</a>';
                                    k++;
                                }
                                tableHtml += '</td>';
                                k++;
                            }
                            else tableHtml += '<td></td>';
                        }
                    }
                    tableHtml += '</tr>';
                }
            }
            $('#schedule_table_tbody').append(tableHtml);
            // $('#loader').hide();
            $('.schedule-content').show();
        }
    });
}

function printScheduleByCookie() {
    switch (cookieTypeSchedule) {
        case '1':
            if (cookieGroup) {
                printScheduleStuds(cookieGroup);
            }
            break;
        case '2':
            if (cookiePrep) {
                printSchedulePreps(cookiePrep);
            }
            break;
        case '3':
            if (cookieAudit) {
                printScheduleAudits(cookieAudit);
            }
            break;
    }
}

function loadPrevWeek()
{
    var prevWeekStart;
    var prevWeekEnd;
    prevWeekStart = CurrentWeekStart - 604800000;
    ds.setTime(prevWeekStart);
    prevWeekEnd = prevWeekStart + 518400000;
    de.setTime(prevWeekEnd);
    CurrentWeekStart = prevWeekStart;
    CurrentWeekEnd = prevWeekEnd;
    $('#title_schedule').children().remove();
    $('#schedule_table').children().remove();
    $('.week-schedule').text('Неделя: ');
    $('.week-schedule').append(ds.getDate()+'.'+addZeroToMonth(1*ds.getMonth()+1)+'.'+ds.getFullYear()+' - '+de.getDate()+'.'+addZeroToMonth(1*de.getMonth()+1)+'.'+de.getFullYear());
    getNumberWeek(CurrentWeekStart);
    $('#title_schedule').text('');
    printScheduleByCookie();
}

function loadNowWeek()
{
    ds.setTime(NowWeekStart);
    de.setTime(NowWeekEnd);
    CurrentWeekStart = NowWeekStart;
    CurrentWeekEnd = NowWeekEnd;
    $('#title_schedule').children().remove();
    $('#schedule_table').children().remove();
    $('.week-schedule').text('Неделя: ');
    $('.week-schedule').append(ds.getDate()+'.'+addZeroToMonth(1*ds.getMonth()+1)+'.'+ds.getFullYear()+' - '+de.getDate()+'.'+addZeroToMonth(1*de.getMonth()+1)+'.'+de.getFullYear());
    getNumberWeek(CurrentWeekStart);
    $('#title_schedule').text('');
    printScheduleByCookie();
}

function loadNextWeek()
{
    var nextWeekStart;
    var nextWeekEnd;
    nextWeekStart = 1*CurrentWeekStart + 604800000;
    ds.setTime(nextWeekStart);
    nextWeekEnd = nextWeekStart + 518400000;
    de.setTime(nextWeekEnd);
    CurrentWeekStart = nextWeekStart;
    CurrentWeekEnd = nextWeekEnd;
    $('#title_schedule').children().remove();
    $('#schedule_table').children().remove();
    $('.week-schedule').text('Неделя: ');
    $('.week-schedule').append(ds.getDate()+'.'+addZeroToMonth(1*ds.getMonth()+1)+'.'+ds.getFullYear()+' - '+de.getDate()+'.'+addZeroToMonth(1*de.getMonth()+1)+'.'+de.getFullYear());
    getNumberWeek(CurrentWeekStart);
    var title_schedule = $('#title_schedule').text();
    $('#title_schedule').text('');
    //закрываем след недели для ИЭУ
    //   var pattern = /группы 081/g;
    //  if (!pattern.test(title_schedule)) {
    printScheduleByCookie();
    //}
}

function changeSchedule(cook, allow)
{
    if (cook == 'exam'){
        if (allow){
            setCookie('CurrentSchedule','lesson',1);
            $('.heading-title').text('Расписание занятий');
            $('.schedule-content .week-schedule, .schedule-content .carousel-controls').show();
            $('#last_now_next').show();
            $('#exam-lesson-link').text('Расписание экзаменов');
        }
        else
            alert('Уважаемые преподаватели и студенты! Расписание занятий на первый семестр 2015/2016 учебного года находится в стадии согласования и будет доступно ближе к началу семестра');
    }
    else {
        setCookie('CurrentSchedule','exam',1)
        $('.heading-title').text('Расписание экзаменов');
        $('.schedule-content .week-schedule, .schedule-content .carousel-controls').hide();
        $('#exam-lesson-link').text('Расписание занятий');
    }
    printScheduleByCookie();
}

function printExamSchedule(val,type)
{
    if (type=='studs'){
        var getJson = '/schedule/'+val+'////printexamschedule';
        var title = 'Расписание экзаменов для группы '+$('#group button[data-value="'+val+'"]').text();
        var col = 'Преподаватель';
    }
    if (type=='preps'){
        var getJson = '/schedule//'+val+'///printexamschedule';
        var title = 'Расписание экзаменов для преподавателя '+$('#prep button[data-value="'+val+'"]').text();
        var col = 'Группа';
    }
    if (type=='audits'){
        var korp = $('#korpus .panel-body .btn.active').data('value');
        var getJson = '/schedule///'+korp+'/'+val+'/printexamschedule';
        var title = 'Расписание экзаменов в аудитории '+val;
        var col = 'Группа, Преподаватель';
    }

    stopAjax();
    jqxhr = $.ajax({
        url: getJson,
        success: function (data){
            if (data == '') {
                $('#title_schedule').text(title+' не найдено');
            }
            else if(val !='') {
                $('#title_schedule').text(title);
                $('#schedule_table').append('<thead>'
                    +'<tr>'
                    +'<th width="15%" class="table_header">Дата</th>'
                    +'<th width="35%" class="table_header">Дисциплина</th>'
                    +'<th width="14%" class="table_header">Вид контроля</th>'
                    +'<th width="9%" class="table_header">Аудитория</th>'
                    +'<th width="7%" class="table_header">Время</th>'
                    +'<th width="20%" class="table_header">'+col+'</th>'
                    +'</tr>'
                    +'</thead>');
                $('#schedule_table').append('<tbody></tbody>');
                for (var i=0; i<data.length; i++) {
                    $('#schedule_table tbody').append('<tr>'
                        +'<td>'+data[i]['DateLesson']+'</td>'
                        +'<td>'+data[i]['TitleSubject']+'</td>'
                        +'<td>'+data[i]['TypeLesson']+'</td>'
                        +'<td>'+data[i]['NumberRoom']+'</td>'
                        +'<td>'+data[i]['Time']+'</td>'
                        +'</tr>');
                    if (type=='studs')
                        $('#schedule_table tbody tr').last().append('<td>'+'<i class="fa fa-user-o" aria-hidden="true"></i> <a href="/employee/'+data[i]['employee_id']+'" target="_blank">'+data[i]['Family']+' '+data[i]['Name'].substring(0,1)+'.'+data[i]['SecondName'].substring(0,1)+'.</a></td>');
                    if (type=='preps')
                        $('#schedule_table tbody tr').last().append('<td><i class="fa fa-users" aria-hidden="true"></i> '+data[i]['Title']+'</td>');
                    if (type=='audits')
                        $('#schedule_table tbody tr').last().append('<td><i class="fa fa-users" aria-hidden="true"></i> '+data[i]['Title']+', '+'<i class="fa fa-user-o" aria-hidden="true"></i> <a href="/employee/'+data[i]['employee_id']+'" target="_blank">'+data[i]['Family']+' '+data[i]['Name'].substring(0,1)+'.'+data[i]['SecondName'].substring(0,1)+'.</a></td>');
                }
            }
            //$('#loader').hide();
            $('.schedule-content').show();
        }
    });
}

function printVersion()
{
    if($('#print_version').text()=='Обычная версия') {
        location.reload();
    }
    else {
        var dc = new Date();
        dc = ds;
        $('#schedule_table .schedule-table-top-header').each(function(){
            $(this).append(' ('+dc.getDate()+'.'+addZeroToMonth(1*dc.getMonth()+1)+'.'+dc.getFullYear()+')');
            dc.setTime(dc.getTime()+86400000);
        });

        var title = $('#title_schedule');
        var table = $('#schedule_table');
        var print = $('#print_version');
        print.text('Обычная версия');
        $('body').children().remove();
        $('body').append(title);
        $('body').css("overflow-x", "initial");
        $('body').append(table);
        /*$('#hat-wrap').css('display','none');
        $('#menu').css('display','none');
        $('#left-menu').css('display','none');
        $('#footer-wrap').css('display','none');
        $('#content').css('margin','0px');
        $('#page-wrap').css('max-width','5000px');
        $('#select_content').css('display','none');
        $('#last_now_next').css('display','none');
        $('#change_filter').css('display','none');
        $('#today_date').css('display','none');
        $('#links').css('display','none');
        $('#mistakes').css('display','none');*/
        $('#schedule_table').css('font-size','12px');
        $('body').append(print);
        $('body').append('&nbsp;&nbsp;&nbsp;&nbsp;<span id="print_text" class="link_inner" onClick="printText()"><i class="fa fa-print" aria-hidden="true"></i> Распечатать</span>');
    }
}

function printText()
{
    window.print();
}
