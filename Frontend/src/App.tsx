import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600 text-center mb-6">
          This is a simple component to test Tailwind CSS styling
        </p>
        
        <div className="bg-indigo-100 rounded-lg p-6 mb-6">
          <p className="text-4xl font-bold text-indigo-600 text-center">
            {count}
          </p>
          <p className="text-sm text-gray-600 text-center mt-2">Counter Value</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setCount(count + 1)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Increment
          </button>
          <button
            onClick={() => setCount(0)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            Tailwind CSS is working!
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
