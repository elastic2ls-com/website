/*carousel functions*/
// $(document).hover(function(){
//   $("#carousel").carousel('pause');
// },function(){
//   $("#carousel").carousel('cycle');
// }


$(document).ready(function(){
    $('.dropdown-toggle').mouseover(function(){
        $('.dropdown-menu').show();
    })

    $('.dropdown-toggle').mouseout(function(){
        t = setTimeout(function() {
            $('.dropdown-menu').hide();
        }, 30);

        $('.dropdown-menu').on('mouseenter', function(){
            $('.dropdown-menu').show();
            clearTimeout(t);
        }).on('mouseleave', function(){
            $('.dropdown-menu').hide();
        })
    })
})
var host = "https://"+window.location.hostname;

var jenkins = "/jenkins-training";
var docker = "/docker-training";
var devops = "/devops-training";
var cloudmigration = "/cloud-migration";
var devopstransformation = "/devops-transformation";
var about = "/about";
var events = "/events";
var blog = "/blog/";
window.onload = function() {
  document.getElementById('hostname1').href = host;
  document.getElementById('hostname2').href = host;
  document.getElementById('jenkins').href = (host,jenkins);
  document.getElementById('docker').href = (host,docker);
  document.getElementById('devops').href = (host,devops);
  document.getElementById('cloudmigration').href = (host,cloudmigration);
  document.getElementById('devopstransformation').href = (host,devopstransformation);
  document.getElementById('about').href = (host,about);
  document.getElementById('events').href = (host,events);
  document.getElementById('blog').href = (host,blog);
}
