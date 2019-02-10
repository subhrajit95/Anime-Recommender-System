// Create the namespace instance
let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'home_page': function(name) {
            let ajax_options = {
                type: 'GET',
                url: '/homepage',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_home_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'read_recommended': function(name) {
            let ajax_options = {
                type: 'GET',
                url: '/recommend/' + name,
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'read_genre': function(genre) {
            let ajax_options = {
                type: 'GET',
                url: '/genres/' + genre,
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';

    let $anime_name = $('#AnimeName');

    // return the API
    return {
        reset: function() {
            $anime_name.val('').focus();
        },
        update_editor: function(name) {
            $anime_name.val(name).focus();
        },
        build_sections: function(recommended_anime, homepage = false) {
            let rows = '';
            let anime_list = [];
            let alter = 0;

            // clear the table
            $('.rows').empty();

            recommended_anime = recommended_anime['data'];

            // get the output
            if (homepage)
                anime_list = recommended_anime['animes'];
            else
                anime_list = recommended_anime['output']['animes'];

            // did we get a people array?
            if (anime_list) {
                for (let i=0, l=anime_list.length; i < l; i++) {
                    let genres = '';

                    let g = anime_list[i].genre.split(',');

                    for (let j = 0, gl = g.length; j < gl; j++) {
                        genres += `<span class = "genre">${g[j]}</span>`
                    }

                    if (alter == 0) {
                        rows += `
                                <!-- Section -->
                                    <section class="wrapper style1">
                                        <div class="inner">
                                            <!-- 2 Columns -->
                                                <div class="flex flex-2">
                                                    <div class="col col1">
                                                        <div class="image fit">
                                                            <img src="${anime_list[i].img_url}" alt="" />
                                                        </div>
                                                    </div>
                                                    <div class="col col2">
                                                        <h3>${anime_list[i].name}</h3>
                                                        <p class = "synopsis">${anime_list[i].synopsis}</p>
                                                        <p class = "genres">
                                                            ${genres}
                                                        </p>
                                                    </div>
                                                </div>
                                        </div>
                                    </section>
                                `
                        alter = 1;
                    }
                    else {
                        rows += `
                                <!-- Section -->
                                    <section class="wrapper style2">
                                        <div class="inner">
                                            <div class="flex flex-2">
                                                <div class="col col2">
                                                        <h3>${anime_list[i].name}</h3>
                                                        <p class = "synopsis">${anime_list[i].synopsis}</p>
                                                        <p class = "genres">
                                                            ${genres}
                                                        </p>
                                                </div>
                                                <div class="col col1 first">
                                                    <div class="image fit">
                                                        <img src="${anime_list[i].img_url}" alt="" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                `
                        alter = 0;
                    }

                }
                $('.rows').append(rows);

                if (!homepage)
                    document.getElementById('main').scrollIntoView();
            }
        },
        events_: function(func) {
            var g = document.querySelectorAll("span.genre");

            for (var i = 0; i < g.length; i++) {
                var g_ = g[i];

                g_.onclick = func;
            }
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $anime_name = $('#AnimeName');

    function genre_anime() {
        let genre_value = $(this)[0].innerHTML;

        if (validate(genre_value)) {
            model.read_genre(genre_value);
        } else {
            alert('Problem with input data');
        }
    }

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.home_page();
    }, 100);


    // Validate input
    function validate(name) {
        return name !== "";
    }

    // Create our event handlers
    $('#getSimilar').click(function(e) {
        let anime_name = $anime_name.val();

        e.preventDefault();

        if (validate(anime_name)) {
            model.read_recommended(anime_name);
        } else {
            alert('Problem with input data');
        }
    });

    $('#reset').click(function() {
        view.reset();
    });

    $('table > tbody').on('dblclick', 'tr', function(e) {
        let $target = $(e.target), name;

        name = $target
            .parent()
            .find('td.name')
            .text();

        view.update_editor(name);
    });

    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        view.build_sections(data);
        view.events_(genre_anime);
    });
    $event_pump.on('model_home_success', function(e, data) {
        view.build_sections(data, true);
        view.events_(genre_anime);
    });

    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        window.open("/404", "_self");
    })
}(ns.model, ns.view));