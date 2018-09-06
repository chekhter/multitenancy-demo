$(document).ready(function () {
    $("#success-alert").hide();
    fetchJobs();
});

$("#createJob").click(function () {
    $("#createJob").addClass('disabled');
    $.ajax({
        url: '/registerJob',
        dataType: 'json',
    }).done(function () {
        jobCreateAlert();
        fetchJobs();
        $("#createJob").removeClass('disabled');
    });
});

function jobCreateAlert() {
    $("#success-alert").fadeTo(2000, 500).slideUp(500, function() {
        $("#success-alert").slideUp(500);
    });
}

function fetchJobs() {
    var jobs = $.ajax({
        url: '/getJobs',
        dataType: 'json',
    }).done(function (result) {
        displayJobs(result);
    });
}

function displayJobs(data) {
    // Crude way of populating a table.
    // TODO: improve this code.
    var jobs = data.results
    $("#jobs tbody").empty();
    $.each(jobs, function (k, v) {
        var bodyContent = "<tr><td>" + v['jobId'] + '</td>';
        bodyContent += "<td>" + v['name'] + '</td>';
        bodyContent += "<td>" + v['tenantId'] + '</td></tr>';
        $("#jobs tbody").append(bodyContent);
    })
}
