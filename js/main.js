var app = new Vue({
    el: '#app',
    data: {
        needSave: false,
        tables: [],
        currTable: null,
        currTableKey: null,
        showModal: false,
        showImport: false,
        newValue: '',
        newLabel: '',
        importValue: ''
    },
    methods: {
        total: function(arr) {
            return Math.round(arr.reduce((acc, item) => parseFloat(acc) + parseFloat(item.value), 0) * 100) / 100;
        },
        getAllTotal: function() {
            let arr = this.tables;
            return Math.round(arr.filter(({ countMe }) => countMe).reduce((acc, item) => parseFloat(acc) + parseFloat(this.total(item.bills)), 0) * 100) / 100;
        },
        countMe: function(key) {
            this.tables[key].countMe = !this.tables[key].countMe;
            this.needSave = true;
        },
        getColor: function(value) {
            if (value > 0)
                return 'positive-color';
            else if (value < 0)
                return 'negative-color';
            return '';
        },
        setNeedSave: function() {
            this.needSave = true;
        },
        importStorage: function(str) {
            localStorage.setItem('tables', str);
            this.getLocalStorage();
            this.showImport = false;
            this.importValue = '';

        },
        addTable: function() {
            this.tables.push({
                name: 'Nouveau Budget',
                bills: [],
                countMe: false,
            });
            this.needSave = true;
        },
        renderModal: function(table, key) {
            this.showModal = true;
            this.currTable = table;
            this.currTableKey = key;
        },
        hideModal: function() {
            this.showModal = false;
        },
        addValue: function() {
            this.currTable.bills.push({
                label: this.newLabel,
                value: this.newValue
            });
            this.newLabel = "";
            this.newValue = "";
            this.needSave = true;
        },
        removeElemInList: function(listKey, elemKey) {
            this.$delete(this.tables[listKey].bills, elemKey);
            this.needSave = true;
        },
        removeElem: function(listKey) {
            this.$delete(this.tables, listKey);
            this.hideModal();
            this.needSave = true;
        },
        saveChange: function() {
            this.setLocalStorage();
            this.hideModal();
        },
        setLocalStorage: function() {
            localStorage.setItem('tables', JSON.stringify(this.tables));
            this.needSave = false;
        },
        getLocalStorage: function() {
            if (localStorage.getItem('tables')) {
                this.tables = JSON.parse(localStorage.getItem('tables'));
            } else {
                this.tables = [{
                    name: 'Fixe',
                    bills: [{
                        label: 'Salaire Net',
                        value: 2085.00
                    }, {
                        label: 'Abonnement Spotify',
                        value: -9.99
                    }],
                    countMe: true,
                }, {
                    name: 'Variable',
                    bills: [{
                        label: 'Salaire futur',
                        value: 2755.00
                    }],
                    countMe: false,
                }]
            }
        },

    },
    beforeMount() {
        this.getLocalStorage();
    }
});
