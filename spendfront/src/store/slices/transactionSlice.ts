import { createSlice } from '@reduxjs/toolkit'

interface TransactionUIState {
  activeTab: 'income' | 'expense'
  formAmount: string
  formCategory: string
  formNote: string
  formDate: string
}

const initialState: TransactionUIState = {
  activeTab: 'income',
  formAmount: '',
  formCategory: 'OTHER',
  formNote: '',
  formDate: new Date().toISOString().slice(0, 10),
}

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    setActiveTab(state, action: { payload: 'income' | 'expense' }) {
      state.activeTab = action.payload
      state.formCategory = 'OTHER'
    },
    setFormAmount(state, action: { payload: string }) {
      state.formAmount = action.payload
    },
    setFormCategory(state, action: { payload: string }) {
      state.formCategory = action.payload
    },
    setFormNote(state, action: { payload: string }) {
      state.formNote = action.payload
    },
    setFormDate(state, action: { payload: string }) {
      state.formDate = action.payload
    },
    resetTransactionForm(state) {
      state.formAmount = ''
      state.formNote = ''
      state.formCategory = 'OTHER'
      state.formDate = new Date().toISOString().slice(0, 10)
    },
  },
})

export const {
  setActiveTab,
  setFormAmount,
  setFormCategory,
  setFormNote,
  setFormDate,
  resetTransactionForm,
} = transactionSlice.actions

export default transactionSlice.reducer
