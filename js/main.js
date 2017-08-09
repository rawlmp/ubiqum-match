$(function () {

    $(".logTitle").hide();
    $(".matchButtonDiv").hide();
    particlesJS.load('particles-js', 'assets/particles.json', function() {
    console.log('callback - particles.js config loaded');
    });
    getJSON();

});

var names = [];

function getURL() {

    return checkLocalStorage();
}

function checkLocalStorage() {

    var inputJSON = $("#newJSON")[0].value;

    //si no hay LS se pone datos.json
    //Si hay LS y es igual a datos.json se pone el nuevo valor de input
    //si hay valor y tiene el mismo valor de input se deja igual

    if (!localStorage.savedJSON) {

        localStorage.setItem("savedJSON", "data.json");

    } else if (inputJSON !== "") {
        localStorage.setItem("savedJSON", inputJSON);
    }
    console.log(localStorage.getItem("savedJSON"));
    console.log(inputJSON);
    return localStorage.getItem("savedJSON");


}

function getJSON() {

    $.ajax({
        dataType: "json",
        url: getURL(),
        success: function (dataPeople) {
            if (!dataPeople.People) {
                alert("Something wrong with your JSON. Back to the default data");
                localStorage.removeItem("savedJSON");
                location.reload();

            }
            var people = dataPeople.People;
            createMatch(people);
        },
        error: function () {
            alert("Something wrong with your JSON. Back to the default data");
            localStorage.removeItem("savedJSON");
            location.reload();
        }
    }

    );
}

function createMatch(people) {

    $.each(people, function (key, value) {
        var div = $("<div/>");
        var image = $("<img/>").attr("src", value.image).attr("data-key", key);
        names.push(value.name);
        div.append(image);
        $("#machine1").append(div);
    })
    createMatch2(people);
}

function createMatch2(people) {

    $.each(people, function (key, value) {
        var div = $("<div/>");
        var image = $("<img/>").attr("src", value.image).attr("data-key", key);
        div.append(image);
        $("#machine2").append(div);
    });
    startMachine(people);
}

function startMachine(people) {

    $(".load").hide();
    
    var machine = new Audio('../audio/slot2.mp3');
    var stoppedAudio = new Audio('../audio/stop1.mp3');
    var matchSound = new Audio('../audio/win.mp3');

    var machine1 = $("#machine1").slotMachine({
        active: 0,
        delay: 500
    });
    var machine2 = $("#machine2").slotMachine({
        active: 10,
        delay: 500,
        direction: 'down'
    });

    var p1 = "";
    var p2 = "";

    function onComplete(active) {

        switch (this.element[0].id) {
            case 'machine1':
                var index = this.element[0].childNodes[1].childNodes[this.active].childNodes[0].attributes[1].value;
                p1 = people[index];
                $("#name1").html(people[index].name);
                stoppedAudio.play();
                break;
            case 'machine2':
                var index2 = this.element[0].childNodes[1].childNodes[this.active].childNodes[0].attributes[1].value;
                p2 = people[index2];
                $("#name2").html(people[index2].name);
                $(".message").html("");
                setCompatibility(p1, p2);
                break;
        }
    }

    function setCompatibility(p1, p2) {

        var randomCompatibility = Math.floor(Math.random() * (99 - 10 + 1) + 10);

        setColor(randomCompatibility, p1, p2);

        if (p1 === p2) {
            $(".message").html("recalculating...");
            $("#name2").html("");
            machine2.shuffle(0, onComplete);
        }
        else if (p1.genre === p2.genre && randomCompatibility >= 75) {
            $('.message').html("It's a HOT GAY match!");
            setMessage(randomCompatibility);
        } else {
            setMessage(randomCompatibility);
        }

    }

    function setMessage(number) {
        if (number < 75) {
            $(".message").html("NO MATCH!!!");
            $(".check").html("");

        } else {
            $(".check").html(number + '%');
            matchSound.play();

        }
        stoppedAudio.play();
        machine.pause();
        machine.currentTime = 0;
        $("#ranomizeButton").toggleClass("hide");
    }

    function setColor(number) {
        if (number < 50) {
            $(".check").css("color", "red");
            $("#randomize").removeClass("spinning");
        } else if (number < 75) {
            $(".check").css("color", "orange");
            $("#randomize").removeClass("spinning");
        } else if (number >= 75) {
            $("#randomize").removeClass("spinning");
            $("#randomize").addClass("blink");                        
            $(".check").css("color", "white");
            $(".check").addClass("pump");
            if (p1 != p2) {
                addMatchToLog(number, p1, p2);
            }
        }
    }

    function addMatchToLog(number, p1, p2) {

        showLog();

        var matchDiv = $("<div/>").addClass("matchDiv");
        var imgDiv = $("<div/>").addClass("matchImg");
        var namesDiv = $("<div/>").addClass("matchNames");
        var numberDiv = $("<div/>").addClass("matchNumber");
        var heart = $('<img/>').addClass("heart").attr("src", "../assets/heart.png");
        var img1 = $("<img/>").attr("src", p1.image);
        var img2 = $("<img/>").attr("src", p2.image);
        var message = $("<span/>");
        var total = $("<span/>");

        message.html(p1.name + " & " + p2.name);
        total.html(number + "%");
        imgDiv.append(img1, heart, img2);
        namesDiv.append(message);
        numberDiv.append(total);
        matchDiv.append(imgDiv, namesDiv, numberDiv);
        $(".logs").prepend(matchDiv);
    }

    function showLog() {
        $(".logTitle").show();
    }

    function hideMatch() {
        $(".matchesLog").toggleClass("hide");
        $(".logTitle").toggleClass("hide");

    }

    $("#ranomizeButton").click(function () {
        if (!machine2.running) {
            $("#randomize").removeClass("blink");
            $("#randomize").addClass("spinning");
            $("#name1").html("");
            $("#name2").html("");
            $(".check").html("");
            $(".message").html('<span class="message">checking...</span>');

            setInterval(slotNames, 50);

            machine.play();
            machine.volume = 0.2;
            $("#ranomizeButton").toggleClass("hide");

            machine1.shuffle(5, onComplete);

            setTimeout(function () {
                machine2.shuffle(10, onComplete);
            }, 10);
        }

        function slotNames() {
            if (machine1.running) {
                $("#name1").html(names[Math.floor(Math.random() * names.length)]);
            }
            if (machine2.running) {
                $("#name2").html(names[Math.floor(Math.random() * names.length)]);
            }
        }

    });



    $("#changeJSON").click(function () {
        getURL();
        location.reload();
    });

    $("#newData").click(function () {
        $(".matchButtonDiv").slideToggle();
        $(this).toggleClass("btn-succes btn-danger");
        var text = $(this).text();
        $(this).text(text == "I want to add my own data" ? "Cancel" : "I want to add my own data");
    })

    // $('#chngBkgrnd').click(function () {
    //     $("body").css('background-image', 'url("http://loremflickr.com/800/600/love")');
    // });
    

}



