<template>
  <div>
    <v-toolbar flat color="white">
      <v-toolbar-title>My CRUD</v-toolbar-title>
      <v-divider class="mx-2" inset vertical></v-divider>
      <v-spacer></v-spacer>
      <v-dialog v-model="dialog" max-width="500px">
        <v-btn slot="activator" color="primary" dark class="mb-2">New Item</v-btn>
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-form>
              <v-flex xs12>
                <v-select
                  :items="customers"
                  v-model="editedItem.customer"
                  item-text="label"
                  item-value="id"
                  label="Байгууллага Нэр"
                   @change="changeCustomer"
                ></v-select>
              </v-flex>
              <v-flex xs12 v-if="editedItem.hasBranch">
                <v-select v-model="editedItem.branch" :items="setOptions" label="Салбарын нэр" item-text="name" item-value="id"></v-select>
              </v-flex>
              <v-flex xs12>
                <v-select v-model="editedItem.item" :items="items" label="Бараа" @change="changeItem" item-text="name"
                  item-value="id"></v-select>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="editedItem.billnumber" label="Баримтын дугаар" type="number"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="editedItem.qty" label="Ширхэг" type="number"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="editedItem.price" label="Үнэ" type="number"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="setTotalPrice" label="Нийт"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-menu
                  :close-on-content-click="false"
                  v-model="menu2"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="editedItem.suppliedDate"
                    label="Нийлүүлсэн Огноо"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
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
    <v-data-table :headers="headers" :items="expeditures" class="elevation-1">
      <template slot="items" slot-scope="props">
        <td>{{ props.item.customer }}</td>
        <td class="text-xs-right">{{ props.item.branch }}</td>
        <td class="text-xs-right">{{ props.item.item }}</td>
        <td class="text-xs-right">{{ props.item.billnumber }}</td>
        <td class="text-xs-right">{{ props.item.qty }}</td>
        <td class="text-xs-right">{{ props.item.price }}</td>
        <td class="text-xs-right">{{ props.item.total }}</td>
        <td class="text-xs-right">{{ props.item.suppliedDate }}</td>
        <td class="justify-center layout px-0">
          <v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
          <v-icon small @click="deleteItem(props.item)">delete</v-icon>
        </td>
      </template>
      <template slot="no-data">
        <v-btn color="primary" @click="initialize">Reset</v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    headers: [
      {
        text: 'Хэрэглэгчийн нэр',
        align: 'left',
        sortable: false,
        value: 'customer'
      },
      { text: 'Салбарын нэр', value: 'branch' },
      { text: 'Барааны Нэр', value: 'item' },
      { text: 'Биллын №', value: 'billnumber' },
      { text: 'Тоо', value: 'qty' },
      { text: 'Үнэ', value: 'price' },
      { text: 'Нийт', value: 'total' },
      { text: 'Нийлүүлсэн огноо', value: 'suppliedDate' },
      { text: 'Actions', value: 'name', sortable: false }
    ],
    customers: [],
    branchs: [],
    menu2: false,
    expeditures: [],
    items: [
      { id: 'item1', name: 'Жигнэмэг, Шанзтай', price: 13200 },
      { id: 'item2', name: 'Жигнэмэг, Давстай', price: 9680 },
      { id: 'item3', name: 'Жигнэмэг, Чацарганатай', price: 9680 },
      { id: 'item4', name: 'Жигнэмэг, сет', price: 32000 },
      { id: 'item5', name: 'Кошихикари, 5кг', price: 34400 },
      { id: 'item6', name: 'Кошихикари, 2кг', price: 14000 },
      { id: 'item7', name: 'Кошихикари, 1кг', price: 7120 }
    ],
    editedIndex: -1,
    editedItem: {
      qty: 1,
      date: new Date(),
      time: new Date(),
      datetime: '',
      suppliedDate: new Date().toISOString().substr(0, 10),
      customer: '',
      branch: '',
      item: '',
      price: 0,
      total: 0,
      billnumber: 0
    },
    defaultItem: {
      qty: 1,
      date: new Date(),
      time: new Date(),
      datetime: '',
      suppliedDate: new Date().toISOString().substr(0, 10),
      customer: '',
      branch: '',
      item: '',
      price: 0,
      total: 0,
      billnumber: 0
    }
  }),

  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Шинэ зарлага' : 'Зарлага засах'
    },
    setTotalPrice: function () {
      return this.editedItem.qty * this.editedItem.price
    },
    setOptions: function () {
      let branchs = this.branchs
      const specificBranch = []
      for (let key in branchs[this.editedItem.customer]) {
        specificBranch.push({
          id: key,
          name: branchs[this.editedItem.customer][key].name,
          namejp: branchs[this.editedItem.customer][key].namejp
        })
      }
      return specificBranch
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
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    }
  },

  created () {
    this.initialize()
  },

  methods: {
    changeCustomer: function (selectedId) {
      this.editedItem.hasBranch = this.customers.find(o => o.id === selectedId).hasBranch
      this.editedItem.branch = ''
    },
    changeItem: function (selectedId) {
      this.editedItem.price = this.items.find(o => o.id === selectedId).price
    },
    initialize () {
      this.$store.dispatch('loadExpenditures').then(() => {
        this.expeditures = this.$store.getters.loadedExpenditures
      })
      this.$store.dispatch('loadCustomers').then(() => {
        this.customers = this.$store.getters.loadedCustomers
      })
      this.$store.dispatch('loadBranches').then(() => {
        this.branchs = this.$store.getters.loadedBranches
      })
    },

    editItem (item) {
      this.editedIndex = this.expeditures.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      const index = this.expeditures.indexOf(item)
      confirm('Are you sure you want to delete this item?') &&
        this.$store.dispatch('removeExpenditure', item.id).then(() => {
          this.expeditures.splice(index, 1)
        })
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
        Object.assign(this.expeditures[this.editedIndex], this.editedItem)
      } else {
        this.editedItem.datetime = this.submittableDateTime
        console.log(this.editedItem)
        this.$store.dispatch('createExpenditure', this.editedItem)
      }
      this.close()
    }
  }
}
</script>
