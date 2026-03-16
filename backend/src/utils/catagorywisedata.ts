
import { IExpense,IIncome } from "../types/type.js"
export const catagorywisedata = (data:IExpense[]|IIncome[])=>{
	return data.reduce<Record<string, number>>((acc, item) => {
		const category = item.category
		acc[category] = (acc[category] ?? 0) + item.amount
		return acc
	}, {})
}