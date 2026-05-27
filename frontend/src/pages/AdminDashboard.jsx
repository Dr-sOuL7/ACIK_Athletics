import AddResultForm from "../forms/AddResultForm";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Activity, Trophy, Calendar } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-heading text-white font-bold mb-2">Admin Dashboard</h1>
        <p className="text-text-muted">Manage platform data and results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-surface border-white/5 flex items-center p-4">
          <Trophy className="w-8 h-8 text-primary mr-4" />
          <div>
            <div className="text-sm text-text-muted">Quick Action</div>
            <div className="font-bold text-white">Add Result</div>
          </div>
        </Card>
        <Card className="bg-surface border-white/5 flex items-center p-4">
          <Calendar className="w-8 h-8 text-secondary mr-4" />
          <div>
            <div className="text-sm text-text-muted">Quick Action</div>
            <div className="font-bold text-white">Manage Events</div>
          </div>
        </Card>
        <Card className="bg-surface border-white/5 flex items-center p-4">
          <Activity className="w-8 h-8 text-success mr-4" />
          <div>
            <div className="text-sm text-text-muted">System Status</div>
            <div className="font-bold text-white">Online</div>
          </div>
        </Card>
      </div>

      <Card className="border-white/5">
        <CardHeader>
          <CardTitle>Add New Result</CardTitle>
        </CardHeader>
        <AddResultForm />
      </Card>
    </div>
  );
}
