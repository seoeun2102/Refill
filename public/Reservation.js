//범용 Semantic ui 사용
$('.ui.modal')
  .modal('show')
;

$('.tool-tip').popup();


$('.ui.checkbox')
  .checkbox()
  ;

  $('.menu .item')
  .tab()
;

$('.accordion')
  .accordion({
    selector: {
      trigger: '.title'
    }
  })
;
$("h4").append($("strong"));

// 예약 홈 --//

// 좌석 선택
select_seat = (item) => {
  document.getElementById("select_seat").textContent  = document.getElementById(item).innerText ;  
  document.getElementById("show_cal").classList.remove("d-none");
}

// 시간 선택
select_hour = (item) => {
  document.getElementById("select_hour").textContent  = document.getElementById(item).innerText;
  document.getElementById("show_seat").classList.remove("d-none"); 
}

// fianl step
select_times = (item) => { 
  document.getElementById("_time_added").textContent  = item;
  document.getElementById("_times").classList.remove("d-none");
  show_pay_box();
}

// 날짜 선택
select_days = (item) => {
  document.getElementById("_days_added").textContent  = item;  
  document.getElementById("_days_t").classList.remove("d-none"); 
  show_pay_box();
}

// 예약 창 보이기
show_pay_box = () =>{
  document.getElementById("pay-box").classList.remove("d-none");
}

show_pays = (item) =>{
  document.getElementById("pills-tabContent").classList.remove("d-none");
  switch (item){
    case 'pills-home-tab':      
      document.getElementById("time_pay").style.display = "block";
     
      document.getElementById("_times").style.display = "none";
      document.getElementById("_days_t").style.display = "none";
     
      break;
    case 'pills-profile-tab':
      document.getElementById("time_pay").style.display = "none";
     
      document.getElementById("_times").style.display = "block";
      document.getElementById("_days_t").style.display = "none";
     
      break;
    case 'pills-contact-tab':
      document.getElementById("time_pay").style.display = "none";
        
        document.getElementById("_times").style.display = "none";
        document.getElementById("_days_t").style.display = "block";
        document.getElementById("pay_locker").style.display = "none";
        break;
    case 'pills-4-tab':
      document.getElementById("time_pay").style.display = "none";
      
        document.getElementById("_times").style.display = "none";
        document.getElementById("_days_t").style.display = "none";
       
    }   
}