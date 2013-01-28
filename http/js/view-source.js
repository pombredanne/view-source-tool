Array.prototype.sift = function(){
  // filters non-truthy items out of an object
  return $.grep(this, function(val, key){
      return val
  })
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}

function targetExec(cmd) {
  var settings = readSettings()
  return $.ajax({
    url: settings.target.url.replace(new RegExp('[^/]+$'), 'exec'),
    type: "POST",
    data: {
      apikey: settings.source.apikey,
      cmd: cmd
    }
  })
}

function readSettings() {
  if (window.location.hash === '') {
    return null
  }
  var hash = window.location.hash.substr(1)
  try {
    return JSON.parse(decodeURIComponent(hash))
  } catch (e) {
    return null
  }
}

function generateFileList(path, callback){
  targetExec('ls -lhA ' + path).done(function(data){
    var list = $.trim(data).split("\n").slice(1)
    var output = '<ul>'
    $.each(list, function(i, line){
      var matches = line.match(/(\S)\S+\s+\S+\s+\S+\s+\S+\s+(\S+)\s+\S+\s+\S+\s+\S+\s+(.+)/) // Mofo Regex
      var t = matches[1]
      var size = matches[2]
      var name = matches[3]
      var url = path + name
      if(t == '-'){
        var type = 'file'
      } else if(t == 'd'){
        var type = 'directory'
        url += '/'
      } else if(t == 'l'){
        var type = 'symlink'
        name = name.split(' -> ')[0]
        url = path + name // do we add a '/' as well? is the link target a directory??
      }
      if(name[0] == '.'){
        type += ' hidden'
      }
      output += '<li><a href="' + url + '" class="' + type + '">' + name + '</a></li>'
    })
    output += '</ul>'
    callback(output)
  }).error(function(x,y,z){
    console.log(x,y,z)
    callback('<p class="error">Error</p>')
  })
}

function drillDown(path, animate, animationCallback, ajaxCallback){
  var duration = (animate == false) ? 0 : 300
  var depth = path.split('/').sift().length
  var $s = $('<section>').css({
    left: $(window).width(),
    zIndex: depth,
    overflow: 'hidden'
  }).attr({
    'data-path': path,
    'data-depth': depth
  })
  $s.appendTo('body').animate({
    left: depth * 80
  }, duration, function(){
    $(this).css('overflow', 'auto')
    if(typeof(animationCallback) == 'function'){
      animationCallback()
    }
  }).prevAll('section').addClass('background')
  $('a[href="' + path + '"]').addClass('active')
  if(path.endsWith('/')){
    $s.html('<p class="loading">Loading directory&hellip;</p>')
    generateFileList(path, function(fileList){
      $s.html(fileList)
      $s.on('click', 'a', function(e){
        e.preventDefault()
        var sectionsAboveThisOne = $(this).parents('section').nextAll('section')
        if(sectionsAboveThisOne.length == 0){
          e.stopPropagation()
          drillDown($(this).attr('href'))
        }
      })
      $s.on('click', function(){
        var sectionsAboveThisOne = $(this).nextAll('section')
        backUp(sectionsAboveThisOne)
      }).on('mouseenter', function(){
        $(this).find('a.selected').removeClass('selected')
      })
      if(typeof(ajaxCallback) == 'function'){
        ajaxCallback()
      }
    })
  } else {
    $s.html('<p class="loading">Loading preview&hellip;</p>')
  }
}

function backUp(sections){
  var $sections = sections || $('section').last()
  if($sections.length < $('section').length){
    $sections.first().prev('section').removeClass('background')
    $sections.each(function(){
      $(this).css({
        overflow: 'hidden'
      }).animate({
        left: $(window).width() + $(this).position().left
      }, function(){
        $('a[href="' + $(this).attr('data-path') + '"]').removeClass('active')
        $(this).remove()
      })
    })
  }
}

function fileDown(){
  var $section = $('section').last()
  var $selected = $('a.selected', $section)
  if($selected.length){
    if(!$selected.parent().is(':last-child')){
      $selected.removeClass('selected').parent().next().children('a').addClass('selected')
    }
  } else {
    $section.find('a').first().addClass('selected')
  }
}

function fileUp(){
  var $section = $('section').last()
  var $selected = $('a.selected', $section)
  if($selected.length){
    if(!$selected.parent().is(':first-child')){
      $selected.removeClass('selected').parent().prev().children('a').addClass('selected')
    }
  } else {
    $section.find('a').last().addClass('selected')
  }
}

function fileEnter(){
  var $selected = $('section').last().find('a.selected')
  if($selected.length){
    drillDown($selected.attr('href'), true, function(){
      $('section').last().find('a').first().addClass('selected')
    })
  } else {
    fileDown()
  }
}

$(function(){

  drillDown('/', false, null, function(){
    $('a[href="/home/"]').addClass('active')
    drillDown('/home/', true)
  })

  $(document).keydown(function(e){
    if((e.which == 27 || e.which == 37) && $('section').length > 1){
      $('section.background').last().find('a.active').addClass('selected')
      backUp()
    } else if(e.which == 38){
      fileUp()
    } else if(e.which == 39 || e.which == 13 || e.which == 32){
      fileEnter()
    } else if(e.which == 40){
      fileDown()
    }
  })

})
