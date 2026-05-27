import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";
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

export default function Events() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await API.get("/events");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-4 border-b border-surface-elevated pb-6">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Upcoming Events</h1>
          <p className="text-text-muted mt-1">Schedules for track and field meets</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <Skeleton className="w-2/3 h-6 mb-4" />
              <Skeleton className="w-full h-4 mb-2" />
              <div className="flex gap-4 mt-6">
                <Skeleton className="w-1/3 h-4" />
                <Skeleton className="w-1/3 h-4" />
              </div>
            </Card>
          ))}
        </div>
      ) : data.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {data.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <Card hover className="h-full flex flex-col group">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      {item.category || "General"}
                    </span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <p className="text-text-muted mb-6 flex-grow whitespace-pre-wrap">
                  {item.description}
                </p>
                <div className="space-y-2 mt-auto pt-4 border-t border-surface-elevated">
                  <div className="flex items-center gap-2 text-sm text-text-main">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(item.event_date).toLocaleDateString(undefined, {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-main">
                    <Clock className="w-4 h-4 text-secondary" />
                    {item.event_time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-main">
                    <MapPin className="w-4 h-4 text-danger" />
                    {item.location}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState 
          icon={Calendar}
          title="No upcoming events"
          description="There are currently no events scheduled. Check back soon!"
        />
      )}
    </div>
  );
}