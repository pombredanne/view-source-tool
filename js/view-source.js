Array.prototype.sift = function(){
  // filters non-truthy items out of an object
  return $.grep(this, function(val, key){
      return val
  })
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}

function generateFileList(path){
  var ul = '<ul>'
  if(path == '/'){
    ul += '<li><a class="directory">bin</a></li>'
    ul += '<li><a class="directory">dev</a></li>'
    ul += '<li><a class="directory">etc</a></li>'
    ul += '<li><a href="' + path + 'home/" class="directory">home</a></li>'
    ul += '<li><a class="directory">lib</a></li>'
    ul += '<li><a class="directory">root</a></li>'
    ul += '<li><a class="directory">tmp</a></li>'
    ul += '<li><a class="directory">usr</a></li>'
    ul += '<li><a class="directory">var</a></li>'
  } else if(path == '/home/'){
    ul += '<li><a href="' + path + '.secret" class="file hidden">.secret</a></li>'
    ul += '<li><a href="' + path + 'http/" class="directory">http</a></li>'
    ul += '<li><a href="' + path + 'scraperwiki.json" class="file json">scraperwiki.json</a></li>'
    ul += '<li><a href="' + path + 'scraperwiki.sqlite" class="file sqlite">scraperwiki.sqlite</a></li>'
    ul += '<li><a href="' + path + 'scraper.py" class="file py">scraper.py</a></li>'
    ul += '<li><a href="' + path + 'setup" class="file">setup</a></li>'
  } else if(path == '/home/http/'){
    ul += '<li><a href="' + path + 'css/" class="directory">css</a></li>'
    ul += '<li><a href="' + path + 'img/" class="directory">img</a></li>'
    ul += '<li><a href="' + path + 'index.html" class="file html">index.html</a></li>'
    ul += '<li><a href="' + path + 'js/" class="directory">js</a></li>'
  } else if(path == '/home/http/css/'){
    ul += '<li><a href="' + path + 'screen.css" class="file css">screen.css</a></li>'
  } else if(path == '/home/http/img/'){
    ul += '<li><a href="' + path + 'loader.gif" class="file gif">loader.gif</a></li>'
    ul += '<li><a href="' + path + 'bakground.png" class="file png">background.png</a></li>'
  } else if(path == '/home/http/js/'){
    ul += '<li><a href="' + path + 'script.js" class="file js">script.js</a></li>'
  }
  ul += '</ul>'
  return ul
}

function drillDown(path, animate, callback){
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
  if(path.endsWith('/')){
    $s.html(generateFileList(path))
  } else {
    $s.html('loading file&hellip;')
  }
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
  $s.appendTo('body').animate({
    left: depth * 80
  }, duration, function(){
    $(this).css('overflow', 'auto')
    if(typeof(callback) != 'undefined'){
      callback()
    }
  }).prevAll('section').addClass('background')
  $('a[href="' + path + '"]').addClass('active')
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

  drillDown('/', false)
  drillDown('/home/')

  $(document).keydown(function(e){
    if((e.which == 27 || e.which == 37) && $('section').length > 1){
      $('section.background').last().find('a.active').addClass('selected')
      backUp()
    } else if(e.which == 38){
      fileUp()
    } else if(e.which == 39){
      fileEnter()
    } else if(e.which == 40){
      fileDown()
    }
  })

})
