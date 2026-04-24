import { createSlice } from '@reduxjs/toolkit'

export interface Goal {
  id: number
  name: string
  amount: number
  totalMoney: number
  startdate: string
  enddate: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  userId: number
}

interface GoalUIState {
  // Create form
  formName: string
  formAmount: string
  formStartdate: string
  formEnddate: string
  // Money modal
  moneyGoalId: number | null
  moneyAmount: string
  moneyMode: 'add' | 'remove'
}

const initialState: GoalUIState = {
  formName: '',
  formAmount: '',
  formStartdate: new Date().toISOString().slice(0, 10),
  formEnddate: '',
  moneyGoalId: null,
  moneyAmount: '',
  moneyMode: 'add',
}

const goalSlice = createSlice({
  name: 'goal',
  initialState,
  reducers: {
    setFormName(state, action: { payload: string }) {
      state.formName = action.payload
    },
    setFormAmount(state, action: { payload: string }) {
      state.formAmount = action.payload
    },
    setFormStartdate(state, action: { payload: string }) {
      state.formStartdate = action.payload
    },
    setFormEnddate(state, action: { payload: string }) {
      state.formEnddate = action.payload
    },
    resetGoalForm(state) {
      state.formName = ''
      state.formAmount = ''
      state.formEnddate = ''
      state.formStartdate = new Date().toISOString().slice(0, 10)
    },
    openMoneyModal(state, action: { payload: { id: number; mode: 'add' | 'remove' } }) {
      state.moneyGoalId = action.payload.id
      state.moneyMode = action.payload.mode
      state.moneyAmount = ''
    },
    closeMoneyModal(state) {
      state.moneyGoalId = null
      state.moneyAmount = ''
    },
    setMoneyAmount(state, action: { payload: string }) {
      state.moneyAmount = action.payload
    },
  },
})

export const {
  setFormName,
  setFormAmount,
  setFormStartdate,
  setFormEnddate,
  resetGoalForm,
  openMoneyModal,
  closeMoneyModal,
  setMoneyAmount,
} = goalSlice.actions

export default goalSlice.reducer
