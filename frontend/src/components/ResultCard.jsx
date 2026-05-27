import { Medal, Star, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "./ui/Card";
import { Button } from "./ui/Button";

export default function ResultCard({ item, showDelete, onDelete }) {
  return (
    <Card hover className="h-full flex flex-col group p-0 overflow-hidden">
      {item.photo_url && (
        <div className="relative h-48 w-full overflow-hidden bg-surface-elevated">
          <img
            src={item.photo_url}
            alt={item.athlete_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100 mix-blend-lighten"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <CardHeader className="mb-2">
          <CardTitle className="group-hover:text-primary transition-colors flex items-center justify-between">
            {item.athlete_name}
            {item.is_best && (
              <span className="flex items-center gap-1 text-xs font-bold bg-success/20 text-success px-2 py-1 rounded-full border border-success/30">
                <Star className="w-3 h-3 fill-success" />
                Best
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <div className="space-y-3 mt-4 text-text-muted flex-grow">
          <div className="flex justify-between border-b border-surface-elevated pb-2">
            <span className="text-sm">Event</span>
            <span className="text-white font-medium">{item.event_name}</span>
          </div>
          <div className="flex justify-between border-b border-surface-elevated pb-2">
            <span className="text-sm">Performance</span>
            <span className="text-white font-medium">{item.performance}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-sm">Position</span>
            <span className="text-white font-medium flex items-center gap-1">
              <Medal className="w-4 h-4 text-secondary" />
              {item.position}
            </span>
          </div>
        </div>

        {showDelete && (
          <Button 
            variant="danger" 
            className="w-full mt-6 gap-2"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" /> Delete Result
          </Button>
        )}
      </div>
    </Card>
  );
}