import { useEffect, useMemo, useState } from 'react'

type EntryType = 'income' | 'expense'
type EntryRecord = {
  id: number
  amount: number
  category: string
  note: string | null
  date: string
}

const incomeCategories = ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER'] as const
const expenseCategories = ['FOOD', 'TRANSPORT', 'RENT', 'SHOPPING', 'ENTERTAINMENT', 'BILLS', 'OTHER'] as const

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function EntryForm() {
  const [entryType, setEntryType] = useState<EntryType>('income')
  const [amount, setAmount] = useState('')
  const [catagory, setCatagory] = useState('SALARY')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState('')
  const [incomes, setIncomes] = useState<EntryRecord[]>([])
  const [expenses, setExpenses] = useState<EntryRecord[]>([])

  const categories = useMemo(
    () => (entryType === 'income' ? incomeCategories : expenseCategories),
    [entryType],
  )

  useEffect(() => {
    setCatagory(categories[0])
  }, [categories])

  const fetchEntries = async () => {
    setDataError('')
    setIsLoadingData(true)

    try {
      const [incomeResponse, expenseResponse] = await Promise.all([
        fetch(`${API_BASE}/income`, { credentials: 'include' }),
        fetch(`${API_BASE}/expense`, { credentials: 'include' }),
      ])

      if (!incomeResponse.ok || !expenseResponse.ok) {
        setDataError('Could not load your entries right now.')
        return
      }

      const incomePayload = (await incomeResponse.json()) as EntryRecord[]
      const expensePayload = (await expenseResponse.json()) as EntryRecord[]
      setIncomes(incomePayload)
      setExpenses(expensePayload)
    } catch {
      setDataError('Network error while loading entries.')
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  const submitEntry = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError('Amount must be a non-negative number.')
      return
    }

    setIsSubmitting(true)
    try {
      const endpoint = entryType === 'income' ? '/addincome' : '/addexpense'
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parsedAmount,
          catagory,
          note: note.trim() || null,
        }),
      })

      const payload = (await response.json().catch(() => null)) as { message?: string } | null
      if (!response.ok) {
        setError(payload?.message ?? `Failed to add ${entryType}.`)
        return
      }

      setAmount('')
      setNote('')
      setMessage(`${entryType === 'income' ? 'Income' : 'Expense'} added successfully.`)
      await fetchEntries()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="entry-shell">
      <div className="entry-card">
        <h1>Add Income / Expense</h1>
        <p>Simple form to create entries for now.</p>

        <form className="entry-form" onSubmit={submitEntry}>
          <label>
            <span>Type</span>
            <select value={entryType} onChange={(event) => setEntryType(event.target.value as EntryType)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>

          <label>
            <span>Amount</span>
            <input
              min={0}
              placeholder="Enter amount"
              step="1"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          <label>
            <span>Category</span>
            <select value={catagory} onChange={(event) => setCatagory(event.target.value)}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Note</span>
            <input
              placeholder="Optional note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>

          {error ? <p className="entry-message error">{error}</p> : null}
          {message ? <p className="entry-message success">{message}</p> : null}

          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Saving...' : `Add ${entryType}`}
          </button>
        </form>

        <div className="entry-lists">
          <div className="entry-list-card">
            <h2>Your Income</h2>
            {isLoadingData ? <p>Loading...</p> : null}
            {!isLoadingData && dataError ? <p className="entry-message error">{dataError}</p> : null}
            {!isLoadingData && !dataError && incomes.length === 0 ? <p>No income added yet.</p> : null}
            {!isLoadingData && !dataError && incomes.length > 0 ? (
              <ul>
                {incomes.map((item) => (
                  <li key={item.id}>
                    <strong>{item.amount}</strong> • {item.category} {item.note ? `• ${item.note}` : ''}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="entry-list-card">
            <h2>Your Expense</h2>
            {isLoadingData ? <p>Loading...</p> : null}
            {!isLoadingData && dataError ? <p className="entry-message error">{dataError}</p> : null}
            {!isLoadingData && !dataError && expenses.length === 0 ? <p>No expense added yet.</p> : null}
            {!isLoadingData && !dataError && expenses.length > 0 ? (
              <ul>
                {expenses.map((item) => (
                  <li key={item.id}>
                    <strong>{item.amount}</strong> • {item.category} {item.note ? `• ${item.note}` : ''}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EntryForm
