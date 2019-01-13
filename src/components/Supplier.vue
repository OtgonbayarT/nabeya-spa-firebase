<template>
  <div v-if="!loading">
    <v-toolbar flat color="white">
      <v-toolbar-title>My CRUD</v-toolbar-title>
      <v-divider
        class="mx-2"
        inset
        vertical
      ></v-divider>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2">Шинэ Бүтээгдэхүүн</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-form>
              <v-flex xs12>
                <v-combobox v-model="editedItem.supplier" :items="suppliers" label="Нийлүүлэгч" @change="setOptions"></v-combobox>
              </v-flex>
              <v-flex xs12>
                <v-combobox v-model="editedItem.item" :items="items" label="Бүтээгдэхүүний Нэр"></v-combobox>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="editedItem.qty" label="Тоо ширхэг"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-menu :close-on-content-click="false" v-model="menu2" :nudge-right="40"
                  lazy transition="scale-transition" offset-y full-width min-width="290px">
                  <v-text-field slot="activator" v-model="editedItem.suppliedDate"
                    label="Нийлүүлсэн Огноо" prepend-icon="event" readonly></v-text-field>
                  <v-date-picker v-model="editedItem.suppliedDate" @input="menu2 = false"></v-date-picker>
                </v-menu>
              </v-flex>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
            <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="desserts"
      class="elevation-1"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.name }}</td>
        <td class="text-xs-right">{{ props.item.calories }}</td>
        <td class="text-xs-right">{{ props.item.fat }}</td>
        <td class="text-xs-right">{{ props.item.carbs }}</td>
        <td class="text-xs-right">{{ props.item.protein }}</td>
        <td class="justify-center layout px-0">
          <v-icon
            small
            class="mr-2"
            @click="editItem(props.item)"
          >
            edit
          </v-icon>
          <v-icon
            small
            @click="deleteItem(props.item)"
          >
            delete
          </v-icon>
        </td>
      </template>
      <template slot="no-data">
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>
  </div>
  <div v-else>

  </div>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    headers: [
      {
        text: 'Dessert (100g serving)',
        align: 'left',
        sortable: false,
        value: 'name'
      },
      { text: 'quantity', value: 'quantity' },
      { text: 'Fat (g)', value: 'fat' },
      { text: 'Carbs (g)', value: 'carbs' },
      { text: 'Protein (g)', value: 'protein' },
      { text: 'Actions', value: 'name', sortable: false }
    ],
    suppliers: [
      'Жүр үр ХХК 2729695',
      'Набэяа шёотэн ХХК',
      'Эко пак ХХК'
    ],
    menu: false,
    modal: false,
    menu2: false,
    items: [],
    desserts: [],
    editedIndex: -1,
    editedItem: {
      qty: '',
      date: new Date(),
      time: new Date(),
      datetime: '',
      suppliedDate: new Date().toISOString().substr(0, 10),
      supplier: 'Жүр үр ХХК 2729695',
      item: ''
    },
    defaultItem: {
      qty: '',
      date: new Date(),
      time: new Date(),
      datetime: '',
      suppliedDate: new Date().toISOString().substr(0, 10),
      supplier: 'Жүр үр ХХК 2729695',
      item: ''
    }
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Шинэ Бүтээгдэхүүн' : 'Бүтээгдэхүүн Засах'
    },
    submittableDateTime () {
      const date = new Date(this.editedItem.date)
      if (typeof this.editedItem.time === 'string') {
        let hours = this.editedItem.time.match(/^(\d+)/)[1]
        const minutes = this.editedItem.time.match(/:(\d+)/)[1]
        date.setHours(hours)
        date.setMinutes(minutes)
      } else {
        date.setHours(this.editedItem.time.getHours())
        date.setMinutes(this.editedItem.time.getMinutes())
      }
      return date
    },
    meetups () {
      // this.$store.dispatch('loadSuppliers')
      return this.$store.getters.loadedSuppliers
    },
    loading () {
      return this.$store.getters.loading
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    }
  },

  updated () {
    this.initialize()
  },

  methods: {
    initialize () {
      this.desserts = this.meetups
    },

    setOptions: function () {
      if (this.editedItem.supplier === 'Жүр үр ХХК 2729695') {
        this.items = [{val: 'Жигнэмэг, Шанзтай', text: 'Жигнэмэг, Шанзтай'},
          {val: 'Жигнэмэг, Давстай', text: 'Жигнэмэг, Давстай'},
          {val: 'Жигнэмэг, Чацарганатай', text: 'Жигнэмэг, Чацарганатай'}]
      } else if (this.editedItem.supplier === 'Набэяа шёотэн ХХК') {
        this.items = [{val: 'Кошихикари, 5кг', text: 'Кошихикари, 5кг'},
          {val: 'Кошихикари, 2кг', text: 'Кошихикари, 2кг'},
          {val: 'Кошихикари, 1кг', text: 'Кошихикари, 1кг'},
          {val: 'Цагаан будаа, 30 кг', text: 'Цагаан будаа, 30 кг'}]
      } else if (this.editedItem.supplier === 'Эко пак ХХК') {
        this.items = [{val: 'Хайрцаг цагаан (Шанзтай)', text: 'Хайрцаг цагаан (Шанзтай)'},
          {val: 'Хайрцаг ягаан (Давстай)', text: 'Хайрцаг ягаан (Давстай)'},
          {val: 'Хайрцаг у.шар (Чацарганатай)', text: 'Хайрцаг у.шар (Чацарганатай)'},
          {val: 'Цаасан уут', text: 'Цаасан уут'}]
      }
      this.editedItem.item = this.items[0].val
    },

    editItem (item) {
      this.editedIndex = this.desserts.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      const index = this.desserts.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.desserts.splice(index, 1)
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.desserts[this.editedIndex], this.editedItem)
      } else {
        this.editedItem.datetime = this.submittableDateTime
        // this.desserts.push(this.editedItem)
        this.$store.dispatch('createSupplier', this.editedItem)
      }
      this.close()
    }
  }
}
</script>
