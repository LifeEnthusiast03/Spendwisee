import { createSlice } from '@reduxjs/toolkit'
import type { BudgetType } from '../../types/types'

interface BudgetUIState {
  activeTab: 'income' | 'expense'
  formCategory: string
  formAmount: string
  formType: BudgetType
}

const initialState: BudgetUIState = {
  activeTab: 'income',
  formCategory: 'OTHER',
  formAmount: '',
  formType: 'MONTHLY',
}

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudgetTab(state, action: { payload: 'income' | 'expense' }) {
      state.activeTab = action.payload
      state.formCategory = 'OTHER'
    },
    setBudgetFormCategory(state, action: { payload: string }) {
      state.formCategory = action.payload
    },
    setBudgetFormAmount(state, action: { payload: string }) {
      state.formAmount = action.payload
    },
    setBudgetFormType(state, action: { payload: BudgetType }) {
      state.formType = action.payload
    },
    resetBudgetForm(state) {
      state.formAmount = ''
      state.formCategory = 'OTHER'
      state.formType = 'MONTHLY'
    },
  },
})

export const {
  setBudgetTab,
  setBudgetFormCategory,
  setBudgetFormAmount,
  setBudgetFormType,
  resetBudgetForm,
} = budgetSlice.actions

export default budgetSlice.reducer
