import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Calendar } from "lucide-react";
import API from "../api/axios";
import { Card, CardHeader, CardTitle } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

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

export default function Announcements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await API.get("/announcements");
        setData(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-surface-elevated pb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Megaphone className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Announcements</h1>
          <p className="text-text-muted mt-1">Stay up to date with the latest news</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <Skeleton className="w-1/3 h-6 mb-4" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-3/4 h-4 mb-4" />
              <Skeleton className="w-1/4 h-4" />
            </Card>
          ))}
        </div>
      ) : data.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {data.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <Card hover className="group border-l-4 border-l-primary/50 hover:border-l-primary">
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <p className="text-text-main text-lg mb-6 whitespace-pre-wrap">
                  {item.message}
                </p>
                <div className="flex items-center gap-2 text-sm text-text-muted bg-surface-elevated w-fit px-3 py-1.5 rounded-lg">
                  <Calendar className="w-4 h-4" />
                  {new Date(item.created_at).toLocaleString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState 
          icon={Megaphone}
          title="No announcements"
          description="There are currently no active announcements to display."
        />
      )}
    </div>
  );
}