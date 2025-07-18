import Card from "../../ui/card/card";

export default function Dashboard() {
    const recentList = [
        { title: "Recent Expense 1", amount: "$50.00", date: "2023-10-01",icon: "💰" },
        { title: "Recent Expense 2", amount: "$30.00", date: "2023-10-02", icon: "🛒" },
        { title: "Recent Expense 3", amount: "$20.00", date: "2023-10-03", icon: "🍕" },
    ]
  return (
    <div className="dashboard-container">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <li>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">This month</h2>
            <p className="text-xl text-green-700 font-semibold">$2,847</p>
          </Card>
        </li>
        <li>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Budget left</h2>
            <p className="text-xl text-red-700 font-semibold">$153</p>
          </Card>
        </li>
        <li>
          <Card>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Transactions</h2>
            <p className="text-xl text-blue-700 font-semibold">47</p>
          </Card>
        </li>
      </ul>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h2>
        <ul>
            {recentList.map((expense, index) => (
                <li key={index} className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2">
                <div className="flex items-center">
                    <span className="text-xl mr-2">{expense.icon}</span>
                    <div className="flex flex-col">
                        <span className="font-medium">{expense.title}</span>
                        <span className="text-gray-600">{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                    
                </div>
                <span className="text-red-700 font-semibold">{expense.amount}</span>
                </li>
            ))}
        </ul>
        </Card>
    </div>
  );
}