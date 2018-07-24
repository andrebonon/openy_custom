(function ($) {
  if (!$('.schedule-dashboard__wrapper').length) {
    return;
  }

  // Attach the datepicker.
  $("#datepicker").datepicker({
    autoclose: true
  });

  // Close the datepicker when clicking outside.
  $(document).click(function(e) {
    var ele = $(e.toElement);
    if (!ele.hasClass("hasDatepicker") && !ele.hasClass("ui-datepicker") && !ele.hasClass("ui-icon") && !$(ele).parent().parents(".ui-datepicker").length) {
      $(".hasDatepicker").datepicker("hide");
    }
  });

  var currentDate = moment().format('ll'),
    eventLocation = '',
    eventCategory = '';

  var globalData = {
    date: currentDate,
    location: '',
    category: '',
    table: []
  };

  $("#datepicker input").val(currentDate);
  $('#datepicker input').on('change', function() {
    if (this.value != '') {
      currentDate = moment(this.value).format('ll');
      globalData.date = currentDate;
    }
  });

  $('.schedule-dashboard__arrow.right').on('click', function() {
    currentDate = moment(currentDate).add(1, 'day').format('ll');
    globalData.date = currentDate;
    $("#datepicker input").val(currentDate);
  });

  $('.schedule-dashboard__arrow.left').on('click', function() {
    currentDate = moment(currentDate).add(-1, 'day').format('ll');
    globalData.date = currentDate;
    $("#datepicker input").val(currentDate);
  });

  $('.form-group-location .box').on('click', function() {
    getValuesLocations();
  });

  $('.form-group-category .box').on('click', function() {
    getValuesCategories();
  });

  // +/- toggle
  $('.schedule-dashboard__sidebar .navbar-header a[data-toggle], .form-group-wrapper label[data-toggle]').on('click', function() {
    $(this).find('i').toggleClass('fa-minus fa-plus');
  });

  function runAjaxRequest(self, date, loc, cat) {
    var url = drupalSettings.path.baseUrl + 'schedules/get-event-data';
    url += loc ? '/' + loc : '/0';
    url += cat ? '/' + cat : '/0';
    url += date ? '/' + date : '';
    $.getJSON(url, function(data) {
      self.globalData.table = data
    });
  }

  function changeDateTitle(text) {
    $('span.date').text(text);
  }

  function getValuesLocations() {
    var chkArray = [];

    $(".form-group-location .box").each(function() {
      if ($(this).is(':checked')) {
        chkArray.push(this.value);
      }
    });

    eventLocation = chkArray.join(',');
    globalData.location = eventLocation;
  }
  getValuesLocations();

  function getValuesCategories() {
    var chkArray = [];

    $(".form-group-category .box").each(function() {
      if ($(this).is(':checked')) {
        chkArray.push(this.value);
      }
    });

    eventCategory = chkArray.join(',');
    globalData.category = eventCategory;
  }
  getValuesCategories();

  // Retrieve the data via vue.js.
  new Vue({
    el: '#app',
    data: {
      globalData: globalData
    },
    components: {
      //Results
    },
    mounted() {
      runAjaxRequest(this, currentDate, eventLocation, eventCategory);
      changeDateTitle(currentDate);
    },
    watch: {
      'globalData.date': function(newValue, oldValue) {
        // this.$root.mounted();
        runAjaxRequest(this, newValue, eventLocation);
        changeDateTitle(newValue);
      },
      'globalData.location': function(newValue, oldValue) {
        runAjaxRequest(this, currentDate, newValue, globalData.category);
      },
      'globalData.category': function(newValue, oldValue) {
        runAjaxRequest(this, currentDate, globalData.location, newValue);
      }
    },
    updated: function() {
      if (typeof(addtocalendar) !== 'undefined') {
        addtocalendar.load();
      }
    },
    delimiters: ["${","}"]
  });

})(jQuery);