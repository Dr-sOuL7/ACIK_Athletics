import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Calendar, FileDown } from "lucide-react";
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
        console.error(err);
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
                {item.file_url && (
                  <div className="mb-6">
                    {item.file_name?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || item.file_url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                      <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={item.file_url} 
                          alt={item.file_name || "Attachment"} 
                          className="w-full max-h-96 object-contain rounded-xl border border-white/10 bg-surface/50 hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ) : (
                      <a 
                        href={item.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface-hover border border-white/10 rounded-xl text-primary transition-colors font-medium text-sm group-hover:border-primary/30"
                      >
                        <FileDown className="w-4 h-4" />
                        {item.file_name || "Download Attachment"}
                      </a>
                    )}
                  </div>
                )}
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