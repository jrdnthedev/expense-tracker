export default function ExpenseForm() {
  return (
    <div className="border border-gray-900/10 pb-12 max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="text-lg font-semibold text-gray-900 mb-2">➕ Add Expense Form</div>
      <div className="text-sm text-gray-500 mb-6">
        Quick expense entry form with smart defaults and category selection. Optimized for fast data entry with minimal friction.
      </div>
      <div>
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Expense</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="$0.00"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What did you spend on?"
            />
          </div>

          <div className="mb-4">
            <label id="category-label" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2" aria-labelledby="category-label">
              <button type="button" className="flex flex-col items-center justify-center p-2 border-2 border-blue-500 rounded-lg bg-blue-50 text-blue-700 font-medium focus:outline-none">
                <span className="text-2xl">🍕</span>
                <span className="text-xs mt-1">Food</span>
              </button>
              <button type="button" className="flex flex-col items-center justify-center p-2 border-2 border-gray-200 rounded-lg hover:border-blue-400">
                <span className="text-2xl">🚗</span>
                <span className="text-xs mt-1">Transport</span>
              </button>
              <button type="button" className="flex flex-col items-center justify-center p-2 border-2 border-gray-200 rounded-lg hover:border-blue-400">
                <span className="text-2xl">🎬</span>
                <span className="text-xs mt-1">Fun</span>
              </button>
              <button type="button" className="flex flex-col items-center justify-center p-2 border-2 border-gray-200 rounded-lg hover:border-blue-400">
                <span className="text-2xl">🛍️</span>
                <span className="text-xs mt-1">Shopping</span>
              </button>
              <button type="button" className="flex flex-col items-center justify-center p-2 border-2 border-gray-200 rounded-lg hover:border-blue-400">
                <span className="text-2xl">🛍️</span>
                <span className="text-xs mt-1">Shopping</span>
              </button>
            </div>
          </div>

          <div className="flex max-sm:flex-col gap-4 mb-4">
            <div className="w-full flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="date">Date</label>
              <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" id="date" defaultValue="2024-12-17" />
            </div>
            <div className="w-full flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time">Time</label>
              <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" id="time" defaultValue="14:30" />
            </div>
          </div>

          <div className="flex max-sm:flex-col gap-4 mt-6">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow transition-colors" type="submit">
              Save Expense
            </button>
            <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md shadow transition-colors" type="button">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
