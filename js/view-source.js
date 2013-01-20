function sift(object){
  // filters non-truthy items out of an object
  return $.grep(object, function(val, key){
      return val
  });
}

function drillDown(path, animate){
  var duration = (animate == false) ? 0 : 300
  var depth = sift(path.split('/')).length
  var $s = $('<section>').css({
    left: $(window).width(),
    zIndex: depth,
    overflow: 'hidden'
  })
  $s.attr({
    'data-path': path,
    'data-depth': depth
  })
  var $ul = $('<ul>')
  if(path == '/'){
    $ul.append('<li><a class="directory">bin</a></li>')
    $ul.append('<li><a class="directory">dev</a></li>')
    $ul.append('<li><a class="directory">etc</a></li>')
    $ul.append('<li><a href="' + path + 'home/" class="directory">home</a></li>')
    $ul.append('<li><a class="directory">lib</a></li>')
    $ul.append('<li><a class="directory">root</a></li>')
    $ul.append('<li><a class="directory">tmp</a></li>')
    $ul.append('<li><a class="directory">usr</a></li>')
    $ul.append('<li><a class="directory">var</a></li>')
  } else if(path == '/home/'){
    $ul.append('<li><a href="' + path + '.secret" class="file hidden">.secret</a></li>')
    $ul.append('<li><a href="' + path + 'http/" class="directory">http</a></li>')
    $ul.append('<li><a href="' + path + 'scraperwiki.json" class="file json">scraperwiki.json</a></li>')
    $ul.append('<li><a href="' + path + 'scraperwiki.sqlite" class="file sqlite">scraperwiki.sqlite</a></li>')
    $ul.append('<li><a href="' + path + 'scraper.py" class="file py">scraper.py</a></li>')
    $ul.append('<li><a href="' + path + 'setup" class="file">setup</a></li>')
  } else if(path == '/home/http/'){
    $ul.append('<li><a href="' + path + 'css/" class="directory">css</a></li>')
    $ul.append('<li><a href="' + path + 'img/" class="directory">img</a></li>')
    $ul.append('<li><a href="' + path + 'index.html" class="file html">index.html</a></li>')
    $ul.append('<li><a href="' + path + 'js/" class="directory">js</a></li>')
  } else if(path == '/home/http/css/'){
    $ul.append('<li><a href="' + path + 'screen.css" class="file css">screen.css</a></li>')
  } else if(path == '/home/http/img/'){
    $ul.append('<li><a href="' + path + 'loader.gif" class="file gif">loader.gif</a></li>')
    $ul.append('<li><a href="' + path + 'bakground.png" class="file png">background.png</a></li>')
  } else if(path == '/home/http/js'){
    $ul.append('<li><a href="' + path + 'script.js" class="file js">script.js</a></li>')
  }
  $ul.appendTo($s)
  $s.on('click', 'a', function(e){
    e.preventDefault()
    var sectionsAboveThisOne = $(this).parents('section').nextAll('section')
    if(sectionsAboveThisOne.length == 0){
      e.stopPropagation()
      if($(this).hasClass('directory')){
        drillDown($(this).attr('href'))
      }
    }
  })
  $s.on('click', function(){
    var sectionsAboveThisOne = $(this).nextAll('section')
    backUp(sectionsAboveThisOne)
  })
  $s.appendTo('body').animate({
    left: depth * 80
  }, duration).prevAll('section').addClass('background')
  $('a[href="' + path + '"]').addClass('active')
}

function backUp(sections){
  var $sections = sections || $('section').last()
  console.log($sections.length, $sections)
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

$(function(){
  drillDown('/', false)
  drillDown('/home/')
})
