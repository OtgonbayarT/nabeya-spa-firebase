import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import router from '@/router'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    appTitle: 'Nabeya',
    user: null,
    error: null,
    loading: false,
    loadedSuppliers: [],
    loadedCustomers: [],
    loadedBranches: [],
    loadedExpenditures: []
  },
  mutations: {
    setUser (state, payload) {
      state.user = payload
    },
    setError (state, payload) {
      state.error = payload
    },
    setLoading (state, payload) {
      state.loading = payload
    },
    createSupplier (state, payload) {
      state.loadedSuppliers.push(payload)
    },
    setLoadedSuppliers (state, payload) {
      state.loadedSuppliers = payload
    },
    createExpenditure (state, payload) {
      state.loadedExpenditures.push(payload)
    },
    updateExpenditure (state, payload) {
      const expenditure = state.loadedExpenditures.find(expenditure => {
        return expenditure.id === payload.id
      })

      expenditure.suppliedDate = payload.suppliedDate
      expenditure.customer = payload.customer
      expenditure.branch = payload.branch
      expenditure.itemDetail = payload.itemDetail
      expenditure.total = payload.total
      expenditure.billnumber = payload.billnumber
      // expenditure.date = payload.datetime.toISOString()
      // expenditure.creatorId = getters.user.email
    },
    removeExpenditure (state, payload) {
      state.loadedExpenditures.splice(state.loadedExpenditures.findIndex(o => o.id === payload), 1)
    },
    setLoadedExpenditures (state, payload) {
      state.loadedExpenditures = payload
    },
    setLoadedCustomers (state, payload) {
      state.loadedCustomers = payload
    },
    setLoadedBranches (state, payload) {
      state.loadedBranches = payload
    }
  },
  actions: {
    userSignUp ({commit}, payload) {
      commit('setLoading', true)
      firebase.auth().createUserWithEmailAndPassword(payload.email, payload.password)
        .then(firebaseUser => {
          commit('setUser', {email: firebaseUser.user.email})
          commit('setLoading', false)
          router.push('/home')
        })
        .catch(error => {
          commit('setError', error.message)
          commit('setLoading', false)
        })
    },
    userSignIn ({commit}, payload) {
      commit('setLoading', true)
      firebase.auth().signInWithEmailAndPassword(payload.email, payload.password)
        .then(firebaseUser => {
          commit('setUser', {email: firebaseUser.user.email})
          commit('setLoading', false)
          commit('setError', null)
          router.push('/home')
        })
        .catch(error => {
          commit('setError', error.message)
          commit('setLoading', false)
        })
    },
    autoSignIn ({commit}, payload) {
      commit('setUser', {email: payload.email})
    },
    userSignOut ({commit}) {
      firebase.auth().signOut()
      commit('setUser', null)
      router.push('/')
    },
    createSupplier ({commit, getters}, payload) {
      const supply = {
        name: payload.name,
        calories: payload.calories,
        fat: payload.fat,
        carbs: payload.carbs,
        protein: payload.protein,
        date: payload.datetime.toISOString()
      }
      firebase.database().ref('supplies').push(supply)
        .then((data) => {
          const key = data.key
          commit('createSupplier', {
            ...supply,
            id: key
          })
        })
        .catch((error) => {
          console.log(error)
        })
      // Reach out to firebase and store it
    },
    loadSuppliers ({commit}) {
      commit('setLoading', true)
      firebase.database().ref('supplies').once('value')
        .then((data) => {
          console.log(data.val())
          const supplies = []
          const obj = data.val()
          for (let key in obj) {
            supplies.push({
              id: key,
              name: obj[key].name,
              calories: obj[key].calories,
              fat: obj[key].fat,
              carbs: obj[key].carbs,
              protein: obj[key].protein,
              date: obj[key].date,
              creatorId: obj[key].creatorId
            })
          }
          commit('setLoadedSuppliers', supplies)
          commit('setLoading', false)
        })
        .catch(
          (error) => {
            console.log(error)
            commit('setLoading', false)
          }
        )
    },
    createExpenditure ({commit, getters}, payload) {
      const expenditure = {
        suppliedDate: payload.suppliedDate,
        customer: payload.customer,
        branch: payload.branch,
        itemDetail: payload.itemDetail,
        total: payload.total,
        billnumber: payload.billnumber,
        date: payload.datetime.toISOString(),
        creatorId: getters.user.email
      }
      firebase.database().ref('expenditures').push(expenditure)
        .then((data) => {
          const key = data.key
          commit('createExpenditure', {
            ...expenditure,
            id: key
          })
        })
        .catch((error) => {
          console.log(error)
        })
    },
    updateExpenditure ({commit, getters}, payload) {
      commit('setLoading', true)
      const updateObj = {}
      updateObj.suppliedDate = payload.suppliedDate
      updateObj.customer = payload.customer
      updateObj.branch = payload.branch
      updateObj.itemDetail = payload.itemDetail
      updateObj.total = payload.total
      updateObj.billnumber = payload.billnumber
      // updateObj.date = payload.datetime.toISOString(),
      updateObj.creatorId = getters.user.email
      firebase.database().ref('expenditures').child(payload.id).update(updateObj)
        .then(() => {
          commit('setLoading', false)
          commit('updateExpenditure', payload)
        })
        .catch(error => {
          console.log(error)
          commit('setLoading', false)
        })
    },
    removeExpenditure ({commit}, payload) {
      return new Promise((resolve, reject) => {
        commit('setLoading', true)
        firebase.database().ref('expenditures').child(payload).remove()
          .then(() => {
            commit('removeExpenditure', payload)
            commit('setLoading', false)
            resolve()
          })
          .catch((error) => {
            console.log(error)
            commit('setLoading', false)
          })
      })
    },
    loadExpenditures ({commit}) {
      return new Promise((resolve, reject) => {
        commit('setLoading', true)
        firebase.database().ref('expenditures').once('value')
          .then((data) => {
            const expenditures = []
            const obj = data.val()
            for (let key in obj) {
              expenditures.push({
                id: key,
                suppliedDate: obj[key].suppliedDate,
                customer: obj[key].customer,
                branch: obj[key].branch,
                itemDetail: obj[key].itemDetail,
                total: obj[key].total,
                billnumber: obj[key].billnumber,
                date: obj[key].date,
                creatorId: obj[key].creatorId
              })
            }
            commit('setLoadedExpenditures', expenditures)
            commit('setLoading', false)
            resolve()
          })
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
          })
      })
    },
    loadCustomers ({commit}) {
      return new Promise((resolve, reject) => {
        commit('setLoading', true)
        firebase.database().ref('customers').once('value')
          .then((data) => {
            const customers = []
            const obj = data.val()
            for (let key in obj) {
              customers.push({
                id: key,
                name: obj[key].name,
                namejp: obj[key].namejp,
                code: obj[key].namejp,
                label: obj[key].label,
                hasBranch: obj[key].hasBranch
              })
            }
            commit('setLoadedCustomers', customers)
            commit('setLoading', false)
            resolve()
          })
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
          })
      })
    },
    loadBranches ({commit}) {
      return new Promise((resolve, reject) => {
        commit('setLoading', true)
        firebase.database().ref('branchs').once('value')
          .then((data) => {
            commit('setLoadedBranches', data.val())
            commit('setLoading', false)
            resolve()
          })
          .catch(error => {
            console.log(error)
            commit('setLoading', false)
          })
      })
    }
  },
  getters: {
    isAuthenticated (state) {
      return state.user !== null && state.user !== undefined
    },
    user (state) {
      return state.user
    },
    loadedSuppliers (state) {
      return state.loadedSuppliers.sort((supplyA, supplyB) => {
        return supplyA.date > supplyB.date
      })
    },
    loadedExpenditures (state) {
      return state.loadedExpenditures
    },
    loadedCustomers (state) {
      return state.loadedCustomers
    },
    loadedBranches (state) {
      return state.loadedBranches
    },
    loading (state) {
      return state.loading
    }
  }
})
