//var host = "http://" +window.location.hostname + ":4000";
var host = "https://" +window.location.hostname;

var consulting = "/#portfolio";
var training = "/#trainings";
var about = "/#ber-uns";
var bloggerei = "/img/bgpublicon.jpg"

var blog = "/blog/";
var impressum = "/impressum/";

window.onload = function() {
  document.getElementById('hostname1').href = host;
  document.getElementById('hostname2').href = host;
  document.getElementById('training').href = (host,training);
  document.getElementById('consulting').href = (host,consulting);
  document.getElementById('about').href = (host,about);
  document.getElementById('blog').href = (host,blog);
  document.getElementById('impressum').href = (host,impressum);
  document.getElementById('bloggerei').src = (host,bloggerei);


}
