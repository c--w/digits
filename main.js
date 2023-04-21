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
    var url = "https://bg.siteorigin.com/api/image?2x=0&blend=41&color=%23f5f1e0&intensity=51&invert=0&noise=0&pattern="+g_patterns[Math.floor(Math.random()*g_patterns.length)];
    $('body').css('background-image', 'url('+url+')');
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
            let op = oper[Math.floor(Math.pow(rand(), 1.3) * 4)];
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

var g_patterns = [
    "45degreee_fabric",
    "60degree_gray",
    "absurdidad",
    "always_grey",
    "arab_tile",
    "arches",
    "argyle",
    "asfalt",
    "assault",
    "az_subtle",
    "back_pattern",
    "batthern",
    "bedge_grunge",
    "beige_paper",
    "bgnoise_lg",
    "billie_holiday",
    "black-Linen",
    "black_denim",
    "black_linen_v2",
    "black_mamba",
    "black_paper",
    "black_scales",
    "black_thread",
    "black_twill",
    "blackmamba",
    "blizzard",
    "blu_stripes",
    "bo_play_pattern",
    "bright_squares",
    "brillant",
    "broken_noise",
    "brushed_alu",
    "brushed_alu_dark",
    "burried",
    "candyhole",
    "carbon_fibre",
    "carbon_fibre_big",
    "carbon_fibre_v2",
    "cardboard",
    "cardboard_flat",
    "cartographer",
    "checkered_pattern",
    "chruch",
    "circles",
    "classy_fabric",
    "clean_textile",
    "climpek",
    "concrete_wall",
    "concrete_wall_2",
    "concrete_wall_3",
    "connect",
    "cork_1",
    "corrugation",
    "cream_dust",
    "crisp_paper_ruffles",
    "crissXcross",
    "cross_scratches",
    "crossed_stripes",
    "crosses",
    "cubes",
    "cutcube",
    "daimond_eyes",
    "dark_Tire",
    "dark_brick_wall",
    "dark_circles",
    "dark_dotted",
    "dark_geometric",
    "dark_leather",
    "dark_matter",
    "dark_mosaic",
    "dark_stripes",
    "dark_wall",
    "dark_wood",
    "darkdenim3",
    "darth_stripe",
    "denim",
    "diagmonds",
    "diagonal-noise",
    "diagonal_striped_brick",
    "diagonal_waves",
    "diamond_upholstery",
    "diamonds",
    "dirty_old_shirt",
    "double_lined",
    "dust",
    "dvsup",
    "egg_shell",
    "elastoplast",
    "elegant_grid",
    "embossed_paper",
    "escheresque",
    "exclusive_paper",
    "extra_clean_paper",
    "fabric_1",
    "fabric_plaid",
    "fake_brick",
    "fake_luxury",
    "fancy_deboss",
    "farmer",
    "felt",
    "first_aid_kit",
    "flowertrail",
    "foggy_birds",
    "foil",
    "frenchstucco",
    "furley_bg",
    "gold_scale",
    "gplaypattern",
    "gradient_squares",
    "graphy",
    "gray_sand",
    "green-fibers",
    "green_dust_scratch",
    "green_gobbler",
    "grey",
    "grey_sandbag",
    "greyfloral",
    "grid",
    "grid_noise",
    "gridme",
    "grilled",
    "groovepaper",
    "grunge_wall",
    "gun_metal",
    "handmadepaper",
    "hexabump",
    "hexellence",
    "hixs_pattern_evolution",
    "husk",
    "ice_age",
    "inflicted",
    "irongrip",
    "knitted-netting",
    "kuji",
    "large_leather",
    "leather_1",
    "lghtmesh",
    "light_alu",
    "light_checkered_tiles",
    "light_grey_floral_motif",
    "light_honeycomb",
    "light_noise_diagonal",
    "light_toast",
    "light_wool",
    "lightpaperfibers",
    "lil_fiber",
    "lined_paper",
    "linen",
    "little_pluses",
    "little_triangles",
    "littleknobs",
    "low_contrast_linen",
    "lyonnette",
    "merely_cubed",
    "micro_carbon",
    "mirrored_squares",
    "nami",
    "nasty_fabric",
    "natural_paper",
    "navy_blue",
    "nistri",
    "noise_lines",
    "noise_pattern_with_crosslines",
    "noisy",
    "noisy_grid",
    "noisy_net",
    "norwegian_rose",
    "office",
    "old_mathematics",
    "old_wall",
    "otis_redding",
    "outlets",
    "padded",
    "paper",
    "paper_1",
    "paper_2",
    "paper_3",
    "paven",
    "perforated_white_leather",
    "pineapplecut",
    "pinstripe",
    "pinstriped_suit",
    "plaid",
    "polaroid",
    "polonez_car",
    "polyester_lite",
    "pool_table",
    "project_papper",
    "psychedelic_pattern",
    "purty_wood",
    "px_by_Gre3g",
    "pyramid",
    "quilt",
    "random_grey_variations",
    "ravenna",
    "real_cf",
    "rebel",
    "redox_01",
    "redox_02",
    "reticular_tissue",
    "retina_dust",
    "retina_wood",
    "retro_intro",
    "ricepaper",
    "ricepaper2",
    "rip_jobs",
    "robots",
    "rockywall",
    "rough_diagonal",
    "roughcloth",
    "rubber_grip",
    "scribble_light",
    "shattered",
    "shinecaro",
    "shinedotted",
    "shl",
    "silver_scales",
    "skelatal_weave",
    "skewed_print",
    "skin_side_up",
    "small-crackle-bright",
    "small_tiles",
    "smooth_wall",
    "snow",
    "soft_circle_scales",
    "soft_kill",
    "soft_pad",
    "soft_wallpaper",
    "solid",
    "square_bg",
    "squares",
    "stacked_circles",
    "starring",
    "stitched_wool",
    "strange_bullseyes",
    "straws",
    "stressed_linen",
    "striped_lens",
    "struckaxiom",
    "stucco",
    "subtle_carbon",
    "subtle_dots",
    "subtle_freckles",
    "subtle_orange_emboss",
    "subtle_stripes",
    "subtle_surface",
    "subtle_zebra_3d",
    "subtlenet2",
    "swirl",
    "tactile_noise",
    "tapestry_pattern",
    "tasky_pattern",
    "tex2res1",
    "tex2res2",
    "tex2res3",
    "tex2res4",
    "tex2res5",
    "textured_stripes",
    "texturetastic_gray",
    "tileable_wood_texture",
    "tiny_grid",
    "triangles",
    "triangles_pattern",
    "txture",
    "type",
    "use_your_illusion",
    "vaio_hard_edge",
    "vertical_cloth",
    "vichy",
    "vintage_speckles",
    "wall4",
    "washi",
    "wavecut",
    "weave",
    "white_bed_sheet",
    "white_brick_wall",
    "white_carbon",
    "white_carbonfiber",
    "white_leather",
    "white_paperboard",
    "white_plaster",
    "white_sand",
    "white_texture",
    "white_tiles",
    "white_wall",
    "white_wave",
    "whitediamond",
    "whitey",
    "wide_rectangles",
    "wild_oliva",
    "wood_1",
    "wood_pattern",
    "worn_dots",
    "woven",
    "xv",
    "zigzag"
]