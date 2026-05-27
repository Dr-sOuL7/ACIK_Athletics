import { useEffect, useState } from "react";
import API from "../api/axios";
import ResultCard from "../components/ResultCard";
import { Skeleton } from "../components/ui/Skeleton";

export default function BestAthletes() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAthletes() {
      try {
        const res = await API.get("/results");
        setAthletes(res.data.filter(r => r.is_best === true));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAthletes();
  }, []);

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4 tracking-tight drop-shadow-md">
          Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Athletes</span>
        </h1>
        <p className="text-text-muted text-lg font-medium tracking-wide uppercase">
          Top performers of the Athletics Club
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => <Skeleton key={n} className="h-[400px] w-full rounded-2xl" />)}
        </div>
      ) : athletes.length === 0 ? (
        <div className="text-center text-text-muted text-xl py-20 bg-surface/30 rounded-2xl border border-white/5">
          No best athletes available at the moment.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {athletes.map((item) => (
            <ResultCard key={item.id} item={item} showDelete={false} />
          ))}
        </div>
      )}
    </div>
  );
}