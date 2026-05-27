import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import API from "../api/axios";
import ResultCard from "../components/ResultCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { Card } from "../components/ui/Card";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await API.get("/results");
        setResults(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  const deleteResult = async (id) => {
    try {
      await API.delete(`/results/${id}`);
      setResults(results.filter((item) => item.id !== id));
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-surface-elevated pb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Competition Results</h1>
          <p className="text-text-muted mt-1">Latest performances and standings</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-0">
              <Skeleton className="w-full h-48 rounded-none" />
              <div className="p-6">
                <Skeleton className="w-2/3 h-6 mb-4" />
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-full h-4 mb-2" />
              </div>
            </Card>
          ))}
        </div>
      ) : results.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {results.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <ResultCard
                item={item}
                showDelete={true}
                onDelete={deleteResult}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState 
          icon={Trophy}
          title="No results found"
          description="Competition results have not been posted yet."
        />
      )}
    </div>
  );
}