import { useState } from "react";
import API from "../api/axios";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

export default function RankingEditor({ item, refresh }) {
  const [formData, setFormData] = useState({
    gold_medals: item.gold_medals,
    silver_medals: item.silver_medals,
    bronze_medals: item.bronze_medals,
    total_points: item.total_points,
    ranking_position: item.ranking_position,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/rankings/${item.id}`, formData);
      alert("Ranking updated");
      refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to update ranking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-xl">{item.athlete_name} - {item.event_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`gold-${item.id}`} className="block text-sm font-medium text-text-muted mb-1">Gold</label>
              <Input id={`gold-${item.id}`} type="number" name="gold_medals" value={formData.gold_medals} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor={`silver-${item.id}`} className="block text-sm font-medium text-text-muted mb-1">Silver</label>
              <Input id={`silver-${item.id}`} type="number" name="silver_medals" value={formData.silver_medals} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor={`bronze-${item.id}`} className="block text-sm font-medium text-text-muted mb-1">Bronze</label>
              <Input id={`bronze-${item.id}`} type="number" name="bronze_medals" value={formData.bronze_medals} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor={`points-${item.id}`} className="block text-sm font-medium text-text-muted mb-1">Points</label>
              <Input id={`points-${item.id}`} type="number" name="total_points" value={formData.total_points} onChange={handleChange} required />
            </div>
            <div className="col-span-2">
              <label htmlFor={`rank-${item.id}`} className="block text-sm font-medium text-text-muted mb-1">Rank</label>
              <Input id={`rank-${item.id}`} type="number" name="ranking_position" value={formData.ranking_position} onChange={handleChange} required />
            </div>
          </div>
          <div className="flex gap-4 pt-2">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Update Ranking"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}