onload = (event) => initGame();
window.onclick = (event) => handleClick(event);

var MAX = 25;
var numbers;
var toguess = 0;
var oper = ['*', '+', '-', '/'];
var undo_stack = [];
var current_numbers;
var total_time = 0;
var games = 0;
var start_time = 0;
var seed;
initSeed();
function initGame() {
    $('#undo').addClass('empty');
    numbers = [];
    for (let i = 0; i < 6; i++) {
        let n = Math.floor(Math.pow(rand(), 1.5) * MAX) + 1;
        numbers.push(n);
    }
    let numbersSorted = [...numbers]
    numbersSorted.sort((a, b) => a - b);
    console.log(numbers);
    num_oper = Math.round(rand() + 4);
    let obj;
    do {
        obj = generateGuess(num_oper, [...numbers]);
    } while (!okGuess(obj.guess))
    console.log(obj.operations);
    toguess = obj.guess;
    $('#guess').html(toguess);
    fillNumbers(numbersSorted);
    $($('.number')[5]).addClass('selected');
    current_numbers = [...numbersSorted];
    undo_stack = [];
    $("#games").text(games);
    $("#time").text(total_time);
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

function generateGuess(num_oper, numbers) {
    let guess;
    let operations = [];
    for (let j = 0; j < num_oper; j++) {
        let first = numbers.splice(Math.floor(Math.pow(rand(), 1.5) * numbers.length), 1)[0];
        let second = numbers.splice(Math.floor(rand() * numbers.length), 1)[0];
        let ev;
        do {
            let op = oper[Math.floor(rand() * 4)];
            ev = first + op + second;
            ev = ev.replace("--", "+");
            ev = ev.replace("+-", "-");
            guess = eval(ev);
        } while(guess == 0 || guess == first || guess == second)
        numbers.unshift(guess);
        operations.push(ev);
    }
    return { guess: guess, operations: operations };
}

function okGuess(num) {
    return (num == Math.round(num) && num > 100 && num < MAX * 20 && !tooEasy(num, numbers));
}

function handleClick(event) {
    let el = $(event.target);
    if (el.hasClass('undo')) {
        if (undo_stack.length > 0) {
            current_numbers = undo_stack.pop();
            fillNumbers(current_numbers);
            if(!undo_stack.length)
                $('#undo').addClass('empty');
        }
    } else if (el.hasClass('number')) {
        if (first_selected() && oper_selected()) {
            undo_stack.push([...current_numbers]);
            $('#undo').removeClass('empty');
            let first_index = $('.number.selected').data('i');
            let second_index = el.data('i');
            if (first_index == second_index) {
                return;
            }
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
                total_time += Math.round((Date.now() - start_time) / 1000);
                setTimeout(initGame, 2000);
            }
        } else {
            if (el.hasClass('selected')) {
                el.removeClass('selected');
                $('.oper').removeClass('selected');
                return;
            } else {
                let first_index = $('.number.selected').data('i');
                if(first_index) {
                    $($('.number')[first_index]).removeClass('selected');
                }
            }
            el.addClass('selected');
        }
    } else if (el.hasClass('oper')) {
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
                let product = numList[i] * numList[j] * numList[k];
                if (product == guess) {
                    return true
                }   
            }
        }
    }
    return false
}

var first_selected = () => $('.number.selected').length;
var oper_selected = () => $('.oper.selected').length;
