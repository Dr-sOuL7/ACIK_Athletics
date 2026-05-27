import { useState } from "react";
import API from "../api/axios";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

export default function AddRankingForm({ refresh }) {
  const [formData, setFormData] = useState({
    athlete_name: "",
    event_name: "",
    gold_medals: 0,
    silver_medals: 0,
    bronze_medals: 0,
    total_points: 0,
    ranking_position: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/rankings", formData);
      alert("Ranking added");
      if (refresh) refresh();
      setFormData({
        athlete_name: "",
        event_name: "",
        gold_medals: 0,
        silver_medals: 0,
        bronze_medals: 0,
        total_points: 0,
        ranking_position: 1,
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add ranking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="athlete_name" className="block text-sm font-medium text-text-muted mb-1">Athlete Name</label>
            <Input id="athlete_name" name="athlete_name" value={formData.athlete_name} placeholder="Athlete Name" onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="event_name" className="block text-sm font-medium text-text-muted mb-1">Event Name</label>
            <Input id="event_name" name="event_name" value={formData.event_name} placeholder="Event Name" onChange={handleChange} required />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="gold_medals" className="block text-sm font-medium text-text-muted mb-1">Gold Medals</label>
              <Input id="gold_medals" type="number" name="gold_medals" value={formData.gold_medals} onChange={handleChange} min="0" required />
            </div>
            <div>
              <label htmlFor="silver_medals" className="block text-sm font-medium text-text-muted mb-1">Silver Medals</label>
              <Input id="silver_medals" type="number" name="silver_medals" value={formData.silver_medals} onChange={handleChange} min="0" required />
            </div>
            <div>
              <label htmlFor="bronze_medals" className="block text-sm font-medium text-text-muted mb-1">Bronze Medals</label>
              <Input id="bronze_medals" type="number" name="bronze_medals" value={formData.bronze_medals} onChange={handleChange} min="0" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="total_points" className="block text-sm font-medium text-text-muted mb-1">Total Points</label>
              <Input id="total_points" type="number" name="total_points" value={formData.total_points} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="ranking_position" className="block text-sm font-medium text-text-muted mb-1">Rank Position</label>
              <Input id="ranking_position" type="number" name="ranking_position" value={formData.ranking_position} onChange={handleChange} min="1" required />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Adding..." : "Add Ranking"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}