var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        tables: [{
            name: 'Fixe',
            bills: [{
                label: 'Salaire Net',
                value: 2085.00
            }, {
                label: 'Spotify',
                value: -9.99
            }]
        }, {
            name: 'Variable',
            bills: []
        }]
    },
    methods: {
        total: function(arr) {
            return arr.reduce((acc, item) => acc + item.value, 0);
        },
        getColor: function(value) {
            if (value > 0)
                return 'positive-color';
            else if (value < 0)
                return 'negative-color';
            return '';
        }
    }
});