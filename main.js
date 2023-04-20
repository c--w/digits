onload = (event) => initGame();
window.onclick = (event) => handleClick(event);

var MAX = 25;
var numbers;
var toguess = 0;
var oper = ['+', '-', '*', '/'];
var seed;
var first_selected = false;
var oper_selected = false;
var undo_stack = [];
var current_numbers;
var total_time = 0;
var games = 0;
var start_time = 0;
seed = Number(getSeed() + '00');
function initGame() {
    start_time = Date.now();
    numbers = [];
    for (let i = 0; i < 6; i++) {
        let n = Math.ceil(rand(seed) * MAX);
        numbers.push(n);
        seed++;
    }
    let numbersSorted = [...numbers]
    numbersSorted.sort((a, b) => a - b);
    console.log(numbers);
    num_oper = Math.round(rand(seed) * 1) + 4;
    do {
        toguess = generateGuess(num_oper, [...numbers]);
    } while (!okGuess(toguess))
    console.log(toguess);
    $('#guess').html(toguess);
    fillNumbers(numbersSorted);
    current_numbers = [...numbersSorted];
    undo_stack = [];
    $("#games").text(games);
    $("#time").text(total_time)
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
    let result;
    for (let j = 0; j < num_oper; j++) {
        seed++;
        let first = numbers.splice(Math.floor(rand(seed) * rand(seed) * numbers.length), 1)[0];
        seed++;
        let second = numbers.splice(Math.floor(rand(seed) * numbers.length), 1)[0];
        seed++;
        let op = oper[Math.floor(rand(seed) * 4)];
        let ev = first + op + second;
        ev = ev.replace("--", "+");
        ev = ev.replace("+-", "-");
        result = eval(ev);
        numbers.unshift(result);
        console.log(ev, numbers);
    }
    return result;
}

function okGuess(num) {
    return (num == Math.round(num) && num > 100 && num < 500);
}

function handleClick(event) {
    let el = $(event.target);
    if (el.hasClass('undo')) {
        if (undo_stack.length > 0) {
            current_numbers = undo_stack.pop();
            fillNumbers(current_numbers);
        }
    } else if (el.hasClass('number')) {
        if (first_selected && oper_selected) {
            undo_stack.push([...current_numbers]);
            let first_index = $('.number.selected').data('i');
            var first = current_numbers[first_index];
            let second_index = el.data('i');
            var second = current_numbers[second_index];
            var oper = $('.oper.selected').attr('oper')
            var result = eval(first + oper + second);
            current_numbers[first_index] = 0;
            current_numbers[second_index] = result;
            fillNumbers(current_numbers);
            $('.oper').removeClass('selected');
            $('.number').removeClass('selected');
            first_selected = false;
            oper_selected = false;
            if(result == toguess) {
                games++;
                total_time+= Math.round((Date.now()-start_time)/1000);
                initGame();         
            }
        } else {
            if (el.hasClass('selected')) {
                el.removeClass('selected');
                $('.oper').removeClass('selected');
                first_selected = false;
                oper_selected = false;
                return;
            }
            $('.number').removeClass('selected');
            el.addClass('selected');
            first_selected = true;
        }
    } else if (el.hasClass('oper')) {
        if (!first_selected)
            return;
        if (el.hasClass('selected')) {
            el.removeClass('selected');
            oper_selected = false;
            return;
        }
        $('.oper').removeClass('selected');
        el.addClass('selected');
        oper_selected = true;
    }
}

function rand(a) {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function getSeed() {
    let now = new Date();
    return now.toISOString().replaceAll("-", "").replaceAll("T", "").replaceAll(":", "").substring(0, 12);
}
