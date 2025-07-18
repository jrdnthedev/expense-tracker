import Card from "../../ui/card/card";

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 mb-2">This month</h2>
          <p className="text-xl text-green-700 font-semibold">$2,847</p>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Budget left</h2>
          <p className="text-xl text-red-700 font-semibold">$153</p>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Transactions</h2>
          <p className="text-xl text-blue-700 font-semibold">47</p>
        </Card>
      </div>
    </div>
  );
}