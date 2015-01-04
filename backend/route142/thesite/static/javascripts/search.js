var t;

$('#searchbox').on('click', function() {
    clearTimeout(t);
    if ($(this).is('.collapsed')) {
        $(this).removeClass('collapsed');
        $(this).find('input').focus();
        setTimeout(function() {
            $('#searchbox').addClass('expandable');
        }, 300);
    }
});

$('#searchbox').on('mousedown mouseup', function() {
    clearTimeout(t);
});

$('#searchbox input, #searchbox button').on('focus', function() {
    clearTimeout(t);
});


$('#searchbox input, #searchbox button').on('blur', function() {
    t = setTimeout(function() {
        $('#searchbox ul').remove();
        $('#searchbox').removeClass('expandable');
        setTimeout(function() {
            $('#searchbox').addClass('collapsing');
            setTimeout(function() {
                $('#searchbox').toggleClass('collapsing collapsed');
            }, 250);
        }, 0);
    }, 75);
});