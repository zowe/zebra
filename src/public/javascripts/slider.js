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
  var selectedLPAR = $('#lpar').val();

  if (!selectedLPAR || selectedLPAR === 'Select LPAR') {
    alert('Please select an LPAR before updating the configuration.');
    return;
  }

  var data = {
    httptype: $(`#httptype`).val(),
    rmf3interval: $(`#rmf3interval`).val(),
    grafanaport: $(`#grafanaport`).val(),
    grafanaurl: $(`#grafanaurl`).val(),
    grafanahttp: $(`#grafanahttp`).val(),
    ppminutesInterval: $(`#ppminutesInterval`).val(),
    apimlIP: $(`#apimlIP`).val(),
    apimlhttp: $(`#apimlhttp`).val(),
    usecert: $(`#usecert`).val(),
    appport: $(`#appport`).val(),
    dbUser: $(`#dbUser`).val(),
    apimlpwd: $(`#apimlpwd`).val(),
    apimluser: $(`#apimluser`).val(),
    apimlport: $(`#apimlport`).val(),
    appurl: $(`#appurl`).val(),
    mongourl: $(`#mongourl`).val(),
    mongoport: $(`#mongoport`).val(),
    dbname: $(`#dbname`).val(),
    dbinterval: $(`#dbinterval`).val(),
    useDbAuth: $(`#useDbAuth`).val(),
    dbPassword: $(`#dbPassword`).val(),
    authSource: $(`#authSource`).val(),
    apimlauth: $(`#apimlauth`).val(),
    dds: {}
  };

  // Add configuration for the selected LPAR
  data.dds[selectedLPAR] = {
    ddshhttptype: $(`#dds_http_${selectedLPAR}`).val(),
    ddsbaseurl: $(`#ddsIP_${selectedLPAR}`).val(),
    ddsbaseport: $(`#ddsport_${selectedLPAR}`).val(),
    ddsauth: $(`#ddsauth_${selectedLPAR}`).val(),
    ddsuser: $(`#ddsuser_${selectedLPAR}`).val(),
    ddspwd: $(`#ddspwd_${selectedLPAR}`).val(),
    rmf3filename: $(`#rmf3filename_${selectedLPAR}`).val(),
    rmfppfilename: $(`#rmfppfilename_${selectedLPAR}`).val(),
    mvsResource: $(`#mvsResource_${selectedLPAR}`).val(),
    PCI: $(`#PCI_${selectedLPAR}`).val(),
    useMongo: $(`#useMongo_${selectedLPAR}`).val(),
    usePrometheus: $(`#usePrometheus_${selectedLPAR}`).val(),
    hmai: {
      ftp: {
        directory: $(`#hmaiFtpDirectory_${selectedLPAR}`).val()
      },
      mysql: {
        host: $(`#hmaiMysqlHost_${selectedLPAR}`).val(),
        user: $(`#hmaiMysqlUser_${selectedLPAR}`).val(),
        password: $(`#hmaiMysqlPassword_${selectedLPAR}`).val()
      },
      dataRetention: {
        clpr: $(`#retentionClpr_${selectedLPAR}`).val(),
        ldev: $(`#retentionLdev_${selectedLPAR}`).val(),
        mpb: $(`#retentionMpb_${selectedLPAR}`).val(),
        mprank20: $(`#retentionMprank20_${selectedLPAR}`).val(),
        pgrp: $(`#retentionPgrp_${selectedLPAR}`).val(),
        port: $(`#retentionPort_${selectedLPAR}`).val()
    },
      checkInterval: $(`#hmaiCheckInterval_${selectedLPAR}`).val(),
      defaultStartDate: $(`#hmaiDefaultStartDate_${selectedLPAR}`).val(),
      continuousMonitoring: $(`#hmaiContinuousMonitoring_${selectedLPAR}`).is(':checked')
    }
  };

  $.ajax({
    type: 'post',
    url: '/updateconfig',
    data: JSON.stringify(data),
    contentType: 'application/json'
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
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Error updating config:", textStatus, errorThrown);
    alert("Error updating config. Please check the console for more details.");
  });
}

function updatedds(key) {
  var data = {
    sysid: key, 
    update: {
      ddshhttptype: $(`#dds_http_${key}`).val(),
      ddsbaseurl: $(`#ddsIP_${key}`).val(),
      ddsbaseport: $(`#ddsport_${key}`).val(),
      ddsauth: $(`#ddsauth_${key}`).val(),
      ddsuser: $(`#ddsuser_${key}`).val(),
      ddspwd: $(`#ddspwd_${key}`).val(),
      rmf3filename: $(`#rmf3filename_${key}`).val(),
      rmfppfilename: $(`#rmfppfilename_${key}`).val(),
      mvsResource: $(`#mvsResource_${key}`).val(),
      PCI: $(`#PCI_${key}`).val(),
      useMongo: $(`#useMongo_${key}`).val(),
      usePrometheus: $(`#usePrometheus_${key}`).val(),
      hmai: {
        ftp: {
          directory: $(`#hmaiFtpDirectory_${key}`).val()
        },
        mysql: {
          host: $(`#hmaiMysqlHost_${key}`).val(),
          user: $(`#hmaiMysqlUser_${key}`).val(),
          password: $(`#hmaiMysqlPassword_${key}`).val()
        },
        dataRetention: {
          clpr: $(`#retentionClpr_${key}`).val(),
          ldev: $(`#retentionLdev_${key}`).val(),
          mpb: $(`#retentionMpb_${key}`).val(),
          mprank20: $(`#retentionMprank20_${key}`).val(),
          pgrp: $(`#retentionPgrp_${key}`).val(),
          port: $(`#retentionPort_${key}`).val()
      },
        checkInterval: $(`#hmaiCheckInterval_${key}`).val(),
        defaultStartDate: $(`#hmaiDefaultStartDate_${key}`).val(),
        continuousMonitoring: $(`#hmaiContinuousMonitoring_${key}`).is(':checked')
      }
    }
  };

  $.ajax({
    type: 'post',
    url: '/updatedds',
    data: JSON.stringify(data),
    contentType: 'application/json'
  })
  .done(function(e) {
    $.ajax({
      url: '/ddsconfig',
    })
    .done(function(e) {
      $('.main').html(e);
    });
    alert(e);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Error updating DDS:", textStatus, errorThrown);
    alert("Error updating DDS. Please check the console for more details.");
  });
}

function savedds() {
  var data = {
    sysid: $(`#sysid`).val(),
    update: {
      ddshhttptype: $(`#dds_http`).val(),
      ddsbaseurl: $(`#ddsIP`).val(),
      ddsbaseport: $(`#ddsport`).val(),
      ddsauth: $(`#ddsauth`).val(),
      ddsuser: $(`#ddsuser`).val(),
      ddspwd: $(`#ddspwd`).val(),
      rmf3filename: $(`#rmf3filename`).val(),
      rmfppfilename: $(`#rmfppfilename`).val(),
      mvsResource: $(`#mvsResource`).val(),
      PCI: $(`#PCI`).val(),
      useMongo: $(`#useMongo`).val(),
      usePrometheus: $(`#usePrometheus`).val(),
      hmai: {
        ftp: {
          directory: $(`#hmaiFtpDirectory`).val()
        },
        mysql: {
          host: $(`#hmaiMysqlHost`).val(),
          user: $(`#hmaiMysqlUser`).val(),
          password: $(`#hmaiMysqlPassword`).val()
        },
        dataRetention: {
          clpr: $(`#retentionClpr`).val(),
          ldev: $(`#retentionLdev`).val(),
          mpb: $(`#retentionMpb`).val(),
          mprank20: $(`#retentionMprank20`).val(),
          pgrp: $(`#retentionPgrp`).val(),
          port: $(`#retentionPort`).val()
      },
        checkInterval: $(`#hmaiCheckInterval`).val(),
        defaultStartDate: $(`#hmaiDefaultStartDate`).val(),
        continuousMonitoring: $(`#hmaiContinuousMonitoring`).is(':checked')
      }
    }
  };

  $.ajax({
    type: 'post',
    url: '/savedds',
    data: JSON.stringify(data),
    contentType: 'application/json'
  })
  .done(function(e) {
    $.ajax({
      url: '/ddsconfig',
    })
    .done(function(e) {
      $('.main').html(e);
    });
    alert(e);
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Error saving DDS:", textStatus, errorThrown);
    alert("Error saving DDS. Please check the console for more details.");
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