onload = (event) => init();
var max_number = 25;
var max_target = 500;
var numbers;
var toguess = 0;
var oper = ['*', '+', '-', '/'];
var undo_stack = [];
var current_numbers;
var last_time = 0;
var total_time = 0;
var games = 0;
var start_time = 0;
var seed;
var startseed;
var gamemode;
function init() {
    document.onclick = (event) => handleClick(event);
    initSeed();
    if(!gamemode) // try cookie
        gamemode = Number(getCookie("gamemode"));
    if (!gamemode) { // try select
        gamemode = $("#gamemode").val();
    }
    $("#gamemode").val(gamemode);
    setCookie("gamemode", gamemode, 730);
    $("#gamemode").on("change", changeGame);
    initGame();
}

function changeGame() {
    gamemode = $("#gamemode").val();
    setCookie("gamemode", gamemode, 730);
    initGame();
}
function initGame() {
    setBckg();
    if(gamemode == 1) {
        max_number = 10;
        max_target = 100
    } else if(gamemode == 2) {
        max_number = 25;
        max_target = 500;
    } else if(gamemode == 3) {
        max_number = 50;
        max_target = 1000;
    } 
    startseed = seed;
    let seed_url;
    if(gamemode == 1) {
        seed_url = 'e' + startseed;
    } else if(gamemode == 2) {
        seed_url = '' + startseed;
    } else if(gamemode == 3) {
        seed_url = 'h' + startseed;
    } 
    var url = window.location.origin + window.location.pathname + "#" + seed_url;
    $("#share-url").val(url);
    $('#undo').addClass('empty');
    numbers = [];
    while (numbers.length < 6) {
        let n = Math.floor(Math.pow(rand(), 1.5) * max_number) + 1;
        if(!numbers.includes(n))
            numbers.push(n);
    }
    let numbersSorted = [...numbers]
    numbersSorted.sort((a, b) => a - b);
    console.log(numbers);
    let obj;
    do {
        obj = generateGuess([...numbers]);
    } while (!okGuess(obj.guess))
    console.log(obj.operations);
    toguess = obj.guess;
    $('#guess').html(toguess);
    fillNumbers(numbersSorted);
    $($('.number')[5]).addClass('selected');
    current_numbers = [...numbersSorted];
    undo_stack = [];
    $("#games").text(games);
    $("#last").text(last_time);
    $("#total").text(total_time);
    if (games)
        $("#avg").text(Math.round(total_time / games));
    start_time = Date.now();
}

function fillNumbers(numbers) {
    $('#numbers').empty();
    numbers.forEach((n, i) => {
        var div = $('<div class="number">' + n + '</div>');
        div.data('n', n);
        div.data('i', i);
        if (n == 0)
            div.addClass('hidden');
        $('#numbers').append(div)
    })
}

function setNumbers(numbers) {
    var numbers_divs = $('.number').toArray();
    numbers_divs.forEach((div, i) => {
        let n = numbers[i];
        var div = $(div);
        div.text(n)
        div.data('n', n);
        div.data('i', i);
        if (n == 0)
            div.addClass('hidden');
        else
            div.removeClass('hidden');
    })
}

function generateGuess(numbers) {
    let guess;
    let operations = [];
    for (let j = 0; j < 5; j++) {
        let first = numbers.splice(Math.floor(Math.pow(rand(), 1) * numbers.length), 1)[0];
        let second = numbers.splice(Math.floor(rand() * numbers.length), 1)[0];
        let ev;
        do {
            let op = oper[Math.floor(Math.pow(rand(), 1.3) * 4)];
            ev = first + op + second;
            ev = ev.replace("--", "+");
            ev = ev.replace("+-", "-");
            guess = eval(ev);
        } while (guess == 0 || guess == first || guess == second)
        numbers.unshift(guess);
        operations.push(ev);
    }
    return { guess: guess, operations: operations };
}

function okGuess(num) {
    if(gamemode == 1)
        return (num == Math.round(num) && num > 50 && num <= 100 && !tooEasy(num, numbers));
    else if(gamemode == 2)
        return (num == Math.round(num) && num > 100 && num <= 500 && !tooEasy(num, numbers));
    else if(gamemode == 3)
        return (num == Math.round(num) && num > 200 && num <= 1000 && !tooEasy(num, numbers));
}

function handleClick(event) {
    let el = $(event.target);
    if (el.hasClass('undo')) {
        effect(el);
        if (undo_stack.length > 0) {
            current_numbers = undo_stack.pop();
            setNumbers(current_numbers);
            $('.number').removeClass('selected');
            $('.oper').removeClass('selected');
            if (!undo_stack.length)
                $('#undo').addClass('empty');
        }
    } else if (el.hasClass('number')) {
        effect(el);
        if (first_selected() && oper_selected()) {
            let first_index = $('.number.selected').data('i');
            let second_index = el.data('i');
            if (first_index == second_index) {
                $($('.number')[first_index]).removeClass('selected');
                $('.oper').removeClass('selected');
                return;
            }
            undo_stack.push([...current_numbers]);
            $('#undo').removeClass('empty');
            var first = current_numbers[first_index];
            var second = current_numbers[second_index];
            var oper = $('.oper.selected').attr('oper')
            var result = eval(first + oper + second);
            current_numbers[first_index] = 0;
            current_numbers[second_index] = result;
            $('.oper').removeClass('selected');
            $($('.number')[first_index]).addClass('hidden');
            $($('.number')[first_index]).removeClass('selected');
            $($('.number')[second_index]).addClass('selected');
            $($('.number')[second_index]).text(result);
            if (result == toguess) {
                $($('.number')[second_index]).addClass('winner');
                games++;
                last_time = Math.round((Date.now() - start_time) / 1000);
                total_time += last_time; 
                setTimeout(initGame, 2000);
            }
        } else {
            if (el.hasClass('selected')) {
                el.removeClass('selected');
                $('.oper').removeClass('selected');
                return;
            } else {
                let first_index = $('.number.selected').data('i');
                if (first_index != undefined) {
                    $($('.number')[first_index]).removeClass('selected');
                }
            }
            el.addClass('selected');
        }
    } else if (el.hasClass('oper')) {
        effect(el);
        if (!first_selected())
            return;
        if (el.hasClass('selected')) {
            el.removeClass('selected');
            return;
        }
        $('.oper').removeClass('selected');
        el.addClass('selected');
    }
}

function rand() {
    seed++;
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function initSeed() {
    if (window.location.hash) {
        seed = window.location.hash.substring(1);
        if(seed.startsWith("e")){
            gamemode = 1;
            seed = seed.substring(1);
        } else if(seed.startsWith("h")){
            gamemode = 3;
            seed = seed.substring(1);
        } else {
            gamemode = 2;
        }
        seed = Number(seed)
        if (!isNaN(seed))
            return;
    }
    let now = new Date();
    seed = now.toISOString().replaceAll("-", "").replaceAll("T", "").replaceAll(":", "").substring(2, 12);
    seed = Number(seed + '0000');
}

function tooEasy(guess, numList) {
    for (let i = numList.length - 1; i > 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
            let product = numList[i] * numList[j]
            if (product == guess) {
                return true
            }
        }
    }
    for (let i = numList.length - 1; i > 0; i--) {
        for (let j = i - 1; j >= 0; j--) {
            for (let k = j - 1; k >= 0; k--) {
                if(gamemode == 1) // no restrictions for easy
                    return;
                // no direct product
                let product = numList[i] * numList[j] * numList[k]; 
                if (product == guess) {
                    return true
                }
                // no a*b+c
                product = numList[i] * numList[j] + numList[k];
                if (product == guess) {
                    return true
                }
                product = numList[j] * numList[k] + numList[i] ;
                if (product == guess) {
                    return true
                }
                product = numList[i] * numList[k] + numList[j] ;
                if (product == guess) {
                    return true
                }
                // no a*b-c
                product = numList[i] * numList[j] - numList[k];
                if (product == guess) {
                    return true
                }
                product = numList[j] * numList[k] - numList[i] ;
                if (product == guess) {
                    return true
                }
                product = numList[i] * numList[k] - numList[j] ;
                if (product == guess) {
                    return true
                }
                if(gamemode == 2)
                    return;
                // no a*(b+c)
                product = numList[i] * (numList[j] + numList[k]);
                if (product == guess) {
                    return true
                }
                product = numList[j] * (numList[k] + numList[i]);
                if (product == guess) {
                    return true
                }
                product = numList[i] * (numList[k] + numList[j]) ;
                if (product == guess) {
                    return true
                }
                // no a*(b-c)
                product = numList[i] * (numList[j] - numList[k]);
                if (product == guess) {
                    return true
                }
                product = numList[j] * (numList[k] - numList[i]);
                if (product == guess) {
                    return true
                }
                product = numList[i] * (numList[k] - numList[j]);
                if (product == guess) {
                    return true
                }
                
            }
        }
    }
    return false
}

function setBckg() {
    var color = (Math.random() * 20 + 235 << 0).toString(16) + (Math.random() * 20 + 235 << 0).toString(16) + (Math.random() * 20 + 235 << 0).toString(16);
    var url = "https://bg.siteorigin.com/api/image?2x=0&blend=40&color=%23" + color + "&intensity=10&invert=0&noise=0&pattern=" + g_patterns[Math.floor(Math.random() * g_patterns.length)];
    $('body').css('background-image', 'url(' + url + ')');
}

function effect(el) {
    el.addClass('effect');
    setTimeout((el) => el.removeClass('effect'), 100, el);
}

var first_selected = () => $('.number.selected').length;
var oper_selected = () => $('.oper.selected').length;


