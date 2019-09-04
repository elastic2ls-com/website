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
