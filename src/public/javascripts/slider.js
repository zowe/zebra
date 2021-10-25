var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}

function updateconfig(){
  var data = { httptype: $(`#httptype`).val(), rmf3interval: $(`#rmf3interval`).val(), grafanaport: $(`#grafanaport`).val(), grafanaurl: $(`#grafanaurl`).val(), grafanahttp: $(`#grafanahttp`).val(), ppminutesInterval: $(`#ppminutesInterval`).val(), apimlIP: $(`#apimlIP`).val(), apimlhttp: $(`#apimlhttp`).val(), usecert: $(`#usecert`).val(), grafanaport: $(`#grafanaport`).val(), appport: $(`#appport`).val(), dbUser: $(`#dbUser`).val(), apimlpwd: $(`#apimlpwd`).val(), apimluser: $(`#apimluser`).val(), apimlport: $(`#apimlport`).val(), appurl: $(`#appurl`).val(), mongourl: $(`#mongourl`).val(), mongoport: $(`#mongoport`).val(), dbname: $(`#dbname`).val(), dbinterval: $(`#dbinterval`).val(), useDbAuth: $(`#useDbAuth`).val(), dbPassword: $(`#dbPassword`).val(), authSource: $(`#authSource`).val(), apimlauth: $(`#apimlauth`).val()};
  $.ajax({
      type: 'post',
      url: '/updateconfig',
      data: data
  })
  .done(function(e){
    $.ajax({
      url: '/otherconfig',
    })
    .done(function(e){
        $('.main').html(e);
    }); 
    alert(e);
  })


}

function updatedds(key) {
  var data = {sysid: key, update: {ddshhttptype: $(`#dds_http_${key}`).val(), ddsbaseurl: $(`#ddsIP_${key}`).val(), ddsbaseport: $(`#ddsport_${key}`).val(), ddsauth: $(`#ddsauth_${key}`).val(), ddsuser: $(`#ddsuser_${key}`).val(), ddspwd: $(`#ddspwd_${key}`).val(), rmf3filename: $(`#rmf3filename_${key}`).val(), rmfppfilename: $(`#rmfppfilename_${key}`).val(), mvsResource: $(`#mvsResource_${key}`).val(), PCI: $(`#PCI_${key}`).val(), useMongo: $(`#useMongo_${key}`).val(), usePrometheus: $(`#usePrometheus_${key}`).val()}};
  $.ajax({
      type: 'post',
      url: '/updatedds',
      data: data
  })
  .done(function(e){
    $.ajax({
      url: '/ddsconfig',
    })
    .done(function(e){
        $('.main').html(e);
    });
    alert(e);
  });
}

function savedds() {
  var data = {sysid: $(`#sysid`).val(), update: {ddshhttptype: $(`#dds_http`).val(), ddsbaseurl: $(`#ddsIP`).val(), ddsbaseport: $(`#ddsport`).val(), ddsauth: $(`#ddsauth`).val(), ddsuser: $(`#ddsuser`).val(), ddspwd: $(`#ddspwd`).val(), rmf3filename: $(`#rmf3filename`).val(), rmfppfilename: $(`#rmfppfilename`).val(), mvsResource: $(`#mvsResource`).val(), PCI: $(`#PCI`).val(), useMongo: $(`#useMongo`).val(), usePrometheus: $(`#usePrometheus`).val()}};
  $.ajax({
      type: 'post',
      url: '/savedds',
      data: data
  })
  .done(function(e){
    $.ajax({
      url: '/ddsconfig',
    })
    .done(function(e){
        $('.main').html(e);
    });
    alert(e);
  });
}

function deletedds(key) {
  var txt;
  var r = confirm(`Are you sure you want to delete ${key}`);
  if (r == true) {
    var data = {sysid: key};
    $.ajax({
        type: 'post',
        url: '/deletedds',
        data: data
    })
    .done(function(e){
      $.ajax({
        url: '/ddsconfig',
      })
      .done(function(e){
          $('.main').html(e);
      });
      alert(e);
    });
  } else {
    
  }
  
}